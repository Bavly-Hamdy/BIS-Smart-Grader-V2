
import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import {
    User, Mail, Briefcase, GraduationCap, BookOpen, Save, Edit2, X,
    Camera, MapPin, Calendar, Award, Upload, Trash2, CheckCircle2
} from 'lucide-react';
import Button from '../Button';
import { FacultyProfile } from '../../types';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../context/ToastContext';

const ProfilePage: React.FC = () => {
    const { addToast } = useToast();
    const [profile, setProfile] = useState<FacultyProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [department, setDepartment] = useState('');
    const [academicRank, setAcademicRank] = useState<string>('Assistant Professor');
    const [specialization, setSpecialization] = useState('');

    const [courseCount, setCourseCount] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setIsLoading(true);
            const user = auth.currentUser;
            if (!user) return;

            // Fetch Profile Data
            const facultyDoc = await getDoc(doc(db, 'faculty', user.uid));
            if (facultyDoc.exists()) {
                const data = facultyDoc.data() as FacultyProfile;
                setProfile(data);
                setFullName(data.fullName);
                setDepartment(data.department);
                setAcademicRank(data.academicRank);
                setSpecialization(data.specialization);
            }

            // Fetch Real Course Count
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const coursesRef = collection(db, 'courses');
            const q = query(coursesRef, where('facultyId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            setCourseCount(querySnapshot.size);

        } catch (err) {
            console.error('Error fetching profile:', err);
            addToast('Error loading profile data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const user = auth.currentUser;
            if (!user) return;

            await updateDoc(doc(db, 'faculty', user.uid), {
                fullName,
                department,
                academicRank,
                specialization,
                updatedAt: new Date().toISOString()
            });

            addToast('Profile updated successfully', 'success');
            setIsEditing(false);
            await fetchProfile(); // Refresh data
        } catch (err) {
            console.error('Error updating profile:', err);
            addToast('Failed to save changes', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        try {
            setIsUploadingPhoto(true);
            const folder = `faculty-profiles/${profile.uid}`;
            const result = await uploadImageToCloudinary(file, folder);

            await updateDoc(doc(db, 'faculty', profile.uid), {
                photoUrl: result.secure_url,
                updatedAt: new Date().toISOString()
            });

            setProfile(prev => prev ? { ...prev, photoUrl: result.secure_url } : null);
            addToast('Profile photo updated', 'success');
        } catch (error) {
            console.error('Error uploading photo:', error);
            addToast('Failed to upload photo', 'error');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleDeletePhoto = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // Prevent triggering the parent's onClick (e.g., change photo)
        if (!profile || !profile.photoUrl) return;

        if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

        try {
            await updateDoc(doc(db, 'faculty', profile.uid), {
                photoUrl: deleteField(),
                updatedAt: new Date().toISOString()
            });

            setProfile(prev => {
                if (!prev) return null;
                const updated = { ...prev };
                delete updated.photoUrl;
                return updated;
            });

            addToast('Profile photo removed', 'success');
        } catch (error) {
            console.error('Error deleting photo:', error);
            addToast('Failed to remove photo', 'error');
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFullName(profile.fullName);
            setDepartment(profile.department);
            setAcademicRank(profile.academicRank);
            setSpecialization(profile.specialization);
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">

            {/* Header Section with Gradient */}
            <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-50"></div>

                <div className="relative p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* Avatar Section */}
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                                <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center relative">
                                    {profile.photoUrl ? (
                                        <img src={profile.photoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-4xl font-bold text-slate-400 dark:text-slate-500">
                                            {profile.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Upload Overlay */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-[1px]"
                                    >
                                        <Camera className="h-8 w-8 text-white mb-1" />
                                        <span className="text-xs font-medium text-white">Change</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons for Avatar */}
                            {profile.photoUrl && (
                                <button
                                    onClick={handleDeletePhoto}
                                    className="absolute bottom-1 right-1 p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity scale-75 md:scale-90"
                                    title="Remove Photo"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}

                            {isUploadingPhoto && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-full z-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left space-y-2 pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <Award className="h-3.5 w-3.5" />
                                {profile.academicRank}
                            </div>

                            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {profile.fullName}
                            </h1>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-600 dark:text-slate-400 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <Briefcase className="h-4 w-4" />
                                    <span>{profile.department}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    <span>Faculty of BIS</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    <span>{profile.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="pt-2">
                            {!isEditing && (
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsEditing(true)}
                                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Quick Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            Account Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                        <BookOpen className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Courses</span>
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{courseCount}</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Member Since</span>
                                </div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{new Date(profile.createdAt).getFullYear()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-2">
                    <motion.div
                        layout
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-500" />
                                Personal Information
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {isEditing ? "Update your details below." : "Your personal and academic details."}
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                {/* Form Fields */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            disabled={!isEditing}
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className={`w-full pl-4 pr-4 py-3 rounded-xl border transition-all outline-none ${isEditing
                                                    ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                                }`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className={`w-full pl-4 pr-4 py-3 rounded-xl border transition-all outline-none ${isEditing
                                                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                                : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                            }`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Academic Rank</label>
                                    <div className="relative">
                                        {isEditing ? (
                                            <select
                                                value={academicRank}
                                                onChange={(e) => setAcademicRank(e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
                                            >
                                                <option value="Professor">Professor</option>
                                                <option value="Associate Professor">Associate Professor</option>
                                                <option value="Assistant Professor">Assistant Professor</option>
                                                <option value="Lecturer">Lecturer</option>
                                                <option value="Teaching Assistant">Teaching Assistant</option>
                                            </select>
                                        ) : (
                                            <div className="w-full pl-4 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-transparent text-slate-500 dark:text-slate-400 cursor-not-allowed">
                                                {academicRank}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Specialization</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        value={specialization}
                                        onChange={(e) => setSpecialization(e.target.value)}
                                        className={`w-full pl-4 pr-4 py-3 rounded-xl border transition-all outline-none ${isEditing
                                                ? 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                                : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <AnimatePresence>
                                {isEditing && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800"
                                    >
                                        <Button
                                            variant="ghost"
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            isLoading={isSaving}
                                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 px-6"
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
