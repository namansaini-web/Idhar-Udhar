import { UserProfile } from '../types';

export interface PredefinedAccount extends UserProfile {
  otp: string;
  cleanPhone: string;
}

export const PREDEFINED_ACCOUNTS: PredefinedAccount[] = [
  {
    id: 'user-aitreya',
    fullName: 'Aitreya Srivastava',
    gender: 'Male',
    phone: '+91 8094597917',
    cleanPhone: '8094597917',
    otp: '2005',
    rollNumber: '12411001',
    collegeId: 'uiet-kurukshetra',
    collegeName: 'UIET Kurukshetra',
    hostelName: 'Shaheed Bhagat Singh',
    roomNumber: 'Room 204',
    course: 'B.Tech CSE',
    year: '1st Year',
    avatarSeed: 'aitreya-srivastava',
    joinedDate: 'Verified 1st Year'
  },
  {
    id: 'user-naman',
    fullName: 'Naman',
    gender: 'Male',
    phone: '+91 9478579360',
    cleanPhone: '9478579360',
    otp: '1183',
    rollNumber: '12411042',
    collegeId: 'uiet-kurukshetra',
    collegeName: 'UIET Kurukshetra',
    hostelName: 'Narhari Bhawan',
    roomNumber: 'Room 112',
    course: 'B.Tech AIML',
    year: '1st Year',
    avatarSeed: 'naman-aiml',
    joinedDate: 'Verified 1st Year'
  },
  {
    id: 'user-rivastik',
    fullName: 'Rivastik',
    gender: 'Male',
    phone: '+91 9034009669',
    cleanPhone: '9034009669',
    otp: '6699',
    rollNumber: '12411078',
    collegeId: 'uiet-kurukshetra',
    collegeName: 'UIET Kurukshetra',
    hostelName: 'Pratap Bhawan',
    roomNumber: 'Room 305',
    course: 'B.Tech AIML',
    year: '1st Year',
    avatarSeed: 'rivastik-aiml',
    joinedDate: 'Verified 1st Year'
  },
  {
    id: 'user-kushboo',
    fullName: 'Kushboo',
    gender: 'Female',
    phone: '+91 9711457323',
    cleanPhone: '9711457323',
    otp: '7323',
    rollNumber: '12411095',
    collegeId: 'uiet-kurukshetra',
    collegeName: 'UIET Kurukshetra',
    hostelName: 'Kalpana Chawla',
    roomNumber: 'Room 108',
    course: 'B.Tech CSE',
    year: '1st Year',
    avatarSeed: 'kushboo-cse',
    joinedDate: 'Verified 1st Year'
  },
  {
    id: 'user-admin',
    fullName: 'Campus Proctor & Admin',
    gender: 'Male',
    phone: '+91 9999999999',
    cleanPhone: '9999999999',
    otp: '9999',
    rollNumber: 'ADMIN-PROCTOR-01',
    collegeId: 'uiet-kurukshetra',
    collegeName: 'UIET Kurukshetra',
    hostelName: 'UIET Administrative Block',
    roomNumber: 'Proctor Office Room 1',
    course: 'Proctorial Board',
    year: 'Campus Administration',
    avatarSeed: 'proctor-admin-uiet',
    joinedDate: 'Verified Proctor',
    isAdmin: true,
  }
];

export const findPredefinedAccountByPhone = (phoneInput: string): PredefinedAccount | undefined => {
  const clean = phoneInput.replace(/\D/g, '').slice(-10);
  return PREDEFINED_ACCOUNTS.find(acc => acc.cleanPhone === clean);
};
