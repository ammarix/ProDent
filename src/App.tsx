import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Search, Calculator, User, 
  List, X, Percent, Info, ArrowUpDown, 
  ChevronUp, ChevronDown, Check, Calendar,
  Stethoscope, History, Edit2, FileText, FlaskConical,
  BarChart2, MoreHorizontal, Gift, Receipt, Undo, Star, MoreVertical, Download, Upload,
  Moon, Sun, Wallet, Activity, CheckCircle2, Clock, XCircle, ArrowRightLeft, Filter, PieChart, ShoppingCart
} from 'lucide-react';

// --- دوال مساعدة ---
const generateId = () => Math.random().toString(36).substring(2, 9);

const getFormattedDate = (dateObj = new Date()) => {
  return dateObj.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' });
};
const getCurrentDate = () => getFormattedDate();
const getCurrentTime = () => new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

const formatCurrency = (num: any) => {
  if (!num && num !== 0) return '0';
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '0';
  return parsed.toLocaleString('en-US');
};

const parseAmount = (val: string) => {
  if (!val) return '';
  const arabicNumbers = '٠١٢٣٤٥٦٧٨٩';
  const englishVal = val.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => arabicNumbers.indexOf(d).toString());
  return englishVal.replace(/[^0-9.-]/g, '');
};

interface Visit {
  id: string;
  date: string;
  procedure: string;
  cost: number;
  paid: number;
  labCost: number;
  notes: string;
  isFinancial?: boolean;
  type?: string;
  snapshot?: {
    cost: number;
    paid: number;
    remaining: number;
  };
  splits?: { id: string, name: string, amount: number }[];
}

interface Withdrawal {
  id: string;
  amount: number;
  date: string;
  time: string;
  timestamp: number;
  note: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  time: string;
  timestamp: number;
  note: string;
}

interface Patient {
  id: string;
  name: string;
  cost: number;
  paid: number;
  remaining: number;
  date: string;
  time: string;
  timestamp: number;
  notes: string;
  nextAppointmentDate: string;
  nextAppointmentTime: string;
  age?: string;
  dateOfBirth?: string;
  phone?: string;
  gender?: string;
  complaint?: string;
  diagnosis?: string;
  transferDoctor?: string;
  transferReason?: string;
  cancelReason?: string;
  postponeReason?: string;
  postponeDate?: string;
  prognosisRating?: number;
  patientSatisfaction?: number;
  doneNotes?: string;
  visits: Visit[];
  status?: 'ongoing' | 'done' | 'postponed' | 'canceled' | 'transferred';
}

interface PatientCardProps {
  key?: string | number;
  patient: Patient;
  index: number;
  total: number;
  onPress: (p: Patient) => void;
  isCustomSort: boolean;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
}

// ==========================================
// 1. مكون بطاقة المريض
// ==========================================
const PatientCard = ({ patient, index, total, onPress, isCustomSort, onMoveUp, onMoveDown }: PatientCardProps) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ongoing': return <Activity size={14} className="text-blue-500" />;
      case 'done': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'postponed': return <Clock size={14} className="text-amber-500" />;
      case 'canceled': return <XCircle size={14} className="text-red-500" />;
      case 'transferred': return <ArrowRightLeft size={14} className="text-purple-500" />;
      default: return <Activity size={14} className="text-gray-300 dark:text-gray-600" />;
    }
  };

  return (
  <div 
    onClick={() => onPress(patient)}
    className="bg-white dark:bg-gray-800 my-1.5 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-1"
  >
    <div className="flex-1 min-w-0 pr-1">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight truncate mb-0.5">{patient.name}</h3>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-[9px] text-gray-400 dark:text-gray-500">{patient.date}</p>
        {patient.nextAppointmentDate && (
          <div className="flex items-center gap-0.5 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded text-[#5a55d2] dark:text-indigo-400 text-[8px] font-bold">
            <Calendar size={8} />
            <span>قادم: {patient.nextAppointmentDate}</span>
          </div>
        )}
      </div>
    </div>

    <div className="flex flex-col items-center justify-center min-w-[24px] border-r border-gray-100 dark:border-gray-700 pr-1">
      {getStatusIcon(patient.status)}
    </div>

    <div className="flex flex-col items-center justify-center min-w-[45px] border-r border-gray-100 dark:border-gray-700 pr-1">
      <p className="text-[9px] text-gray-400 dark:text-gray-500 mb-0.5">التكلفة</p>
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(patient.cost)}</p>
    </div>

    <div className="flex flex-col items-center justify-center min-w-[45px] border-r border-gray-100 dark:border-gray-700 pr-1">
      <p className="text-[9px] text-[#5a55d2] dark:text-indigo-400 mb-0.5">المدفوع</p>
      <p className="text-xs font-bold text-[#5a55d2] dark:text-indigo-400">{formatCurrency(patient.paid)}</p>
    </div>

    <div className="flex flex-col items-center justify-center min-w-[45px] border-r border-gray-100 dark:border-gray-700 pr-1 pl-1">
      <p className="text-[9px] text-amber-500 dark:text-amber-400 mb-0.5 font-bold">المتبقي</p>
      <p className="text-xs font-black text-amber-500 dark:text-amber-400">{formatCurrency(patient.remaining)}</p>
    </div>

    {isCustomSort && (
      <div className="flex flex-col gap-1 border-r border-gray-100 dark:border-gray-700 pr-1 pl-1" onClick={(e) => e.stopPropagation()}>
         <button disabled={index === 0} onClick={() => onMoveUp(index)} className="text-gray-400 dark:text-gray-500 hover:text-[#5a55d2] dark:hover:text-indigo-400 disabled:opacity-20 p-0.5"><ChevronUp size={14}/></button>
         <button disabled={index === total - 1} onClick={() => onMoveDown(index)} className="text-gray-400 dark:text-gray-500 hover:text-[#5a55d2] dark:hover:text-indigo-400 disabled:opacity-20 p-0.5"><ChevronDown size={14}/></button>
      </div>
    )}
  </div>
)};

// ==========================================
// المكون الرئيسي (App)
// ==========================================
export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [paid, setPaid] = useState('');
  
  const [showNewNotes, setShowNewNotes] = useState(false);
  const [showStatusDetails, setShowStatusDetails] = useState(true);

  const calculateAge = (yearStr: string) => {
    if (!yearStr) return '';
    const yearNum = parseInt(yearStr);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) return '';
    return (new Date().getFullYear() - yearNum).toString();
  };

  const calculateYear = (ageStr: string) => {
    if (!ageStr) return '';
    const ageNum = parseInt(ageStr);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) return '';
    return (new Date().getFullYear() - ageNum).toString();
  };

  const handleNewPatientAgeChange = (val: string) => {
    setNewPatientAge(val);
    setNewPatientDob(calculateYear(val));
  };

  const handleNewPatientDobChange = (val: string) => {
    setNewPatientDob(val);
    setNewPatientAge(calculateAge(val));
  };

  const handlePatientAgeChange = (patient: Patient, val: string) => {
    setSelectedPatient({...patient, age: val, dateOfBirth: calculateYear(val)});
  };

  const handlePatientDobChange = (patient: Patient, val: string) => {
    setSelectedPatient({...patient, dateOfBirth: val, age: calculateAge(val)});
  };

  const [newPatientNotes, setNewPatientNotes] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('');
  const [newPatientComplaint, setNewPatientComplaint] = useState('');
  const [newPatientDiagnosis, setNewPatientDiagnosis] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [noteConfirmed, setNoteConfirmed] = useState(false);
  const [isEditingPatientDetails, setIsEditingPatientDetails] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  const [reportModalType, setReportModalType] = useState('none');
  const [showReports, setShowReports] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showWithdrawals, setShowWithdrawals] = useState(false);
  const [highlightEditBtn, setHighlightEditBtn] = useState(false);
  
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');

  const [showExpenses, setShowExpenses] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');

  const [sortBy, setSortBy] = useState('date');
  const [sortDesc, setSortDesc] = useState(true);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [showMonthMenu, setShowMonthMenu] = useState(false);

  const [calcPercent, setCalcPercent] = useState('30');
  const [deductLabCost, setDeductLabCost] = useState(false);
  const [deductWithdrawals, setDeductWithdrawals] = useState(false);
  const [calcFromRemaining, setCalcFromRemaining] = useState(false);
  const [calcFromTotal, setCalcFromTotal] = useState(false);

  // حالة إضافة/تعديل جلسة علاجية
  const [sessionProcedure, setSessionProcedure] = useState('');
  const [sessionCost, setSessionCost] = useState('');
  const [sessionPaid, setSessionPaid] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);

  // حالات العمليات المالية (القائمة المصغرة)
  const [showFinancialMenu, setShowFinancialMenu] = useState(false);
  const [financialAction, setFinancialAction] = useState<string | null>(null); // 'lab' | 'discount' | 'fee' | 'refund'
  const [finAmount, setFinAmount] = useState('');
  const [finNote, setFinNote] = useState('');
  const [finLabWorkType, setFinLabWorkType] = useState('');

  const [showEditAmountsModal, setShowEditAmountsModal] = useState(false);
  const [editCostAmount, setEditCostAmount] = useState('');
  const [editPaidAmount, setEditPaidAmount] = useState('');

  const [showCostDetailsModal, setShowCostDetailsModal] = useState(false);
  const [showVisitSplitModal, setShowVisitSplitModal] = useState(false);
  const [showPatientPaidModal, setShowPatientPaidModal] = useState(false);
  const [activeSplitVisitId, setActiveSplitVisitId] = useState<string | null>(null);
  
  const [splitName, setSplitName] = useState('');
  const [splitAmount, setSplitAmount] = useState('');
  const [tempVisitSplits, setTempVisitSplits] = useState<{ id: string, name: string, amount: number }[]>([]);
  const [editingSplitId, setEditingSplitId] = useState<string | null>(null);
  const [editingSplitName, setEditingSplitName] = useState('');
  const [editingSplitAmount, setEditingSplitAmount] = useState('');
  
  const [expandedVisits, setExpandedVisits] = useState<string[]>([]);
  
  const toggleVisitExpansion = (visitId: string) => {
    setExpandedVisits(prev => prev.includes(visitId) ? prev.filter(id => id !== visitId) : [...prev, visitId]);
  };

  // حالات جديدة للتحكم في واجهة السجل والنوافذ المنبثقة المخصصة
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [dialog, setDialog] = useState<{ visible: boolean, message: string, type: 'alert' | 'confirm', onConfirm: (() => void) | null }>({ visible: false, message: '', type: 'alert', onConfirm: null });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const showAlert = (message: string) => setDialog({ visible: true, message, type: 'alert', onConfirm: null });
  const showConfirm = (message: string, onConfirm: () => void) => setDialog({ visible: true, message, type: 'confirm', onConfirm });

  useEffect(() => {
    const saved = localStorage.getItem('@patients_pro_data_v3');
    if (saved) {
      try {
        setPatients(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading data', e);
      }
    }
    const savedWithdrawals = localStorage.getItem('@patients_withdrawals_v1');
    if (savedWithdrawals) {
      try { setWithdrawals(JSON.parse(savedWithdrawals)); } catch (e) {}
    }
    const savedExpenses = localStorage.getItem('@patients_expenses_v1');
    if (savedExpenses) {
      try { setExpenses(JSON.parse(savedExpenses)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('@patients_pro_data_v3', JSON.stringify(patients));
    } catch (e) {
      console.error('Error saving data', e);
    }
  }, [patients]);

  useEffect(() => {
    try { localStorage.setItem('@patients_withdrawals_v1', JSON.stringify(withdrawals)); } catch(e) {}
  }, [withdrawals]);

  useEffect(() => {
    try { localStorage.setItem('@patients_expenses_v1', JSON.stringify(expenses)); } catch(e) {}
  }, [expenses]);

  const handleExportData = () => {
    try {
      const dataToExport = {
        version: '1.2',
        exportDate: new Date().toISOString(),
        patients,
        withdrawals,
        expenses
      };
      
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      
      const dateObj = new Date();
      const datePart = dateObj.toISOString().split('T')[0];
      const timePart = dateObj.toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `DentPro_${datePart}_${timePart}.json`;

      downloadAnchorNode.setAttribute('download', filename);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      setShowAppSettings(false);
      showAlert('تم تصدير البيانات بنجاح في ملف للنسخ الاحتياطي.');
    } catch (error) {
      showAlert('حدث خطأ أثناء التصدير.');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (importedData && importedData.patients && Array.isArray(importedData.patients)) {
          showConfirm('هل أنت متأكد من استيراد هذه النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.', () => {
            // Restore backwards-compatible structure mapping
            setPatients(importedData.patients || []);
            setWithdrawals(importedData.withdrawals || []);
            setExpenses(importedData.expenses || []);
            
            showAlert('تم استيراد البيانات واسترجاع النسخة الاحتياطية بنجاح!');
            
            // Allow resetting file input after successful import
            if (fileInputRef.current) fileInputRef.current.value = '';
          });
        } else {
          showAlert('ملف النسخة الاحتياطية غير صالح أو غير مدعوم.');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch (error) {
        showAlert('يوجد خطأ في محتوى الملف.');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      setShowAppSettings(false);
    };
    reader.readAsText(file);
  };

  const handleAddPatient = () => {
    if (isAdding) return;
    if (!name.trim()) { showAlert('يرجى إدخال اسم المريض.'); return; }

    setIsAdding(true);
    const parsedCost = parseFloat(cost) || 0;
    const parsedPaid = paid === '' ? 0 : parseFloat(paid);
    
    const newPatient: Patient = {
      id: generateId(),
      name,
      cost: parsedCost,
      paid: parsedPaid,
      remaining: parsedCost - parsedPaid,
      date: getCurrentDate(),
      time: getCurrentTime(),
      timestamp: Date.now(),
      notes: '',
      nextAppointmentDate: '',
      nextAppointmentTime: '',
      age: newPatientAge,
      dateOfBirth: newPatientDob,
      phone: newPatientPhone,
      gender: newPatientGender,
      complaint: newPatientComplaint,
      diagnosis: newPatientDiagnosis,
      visits: (parsedCost > 0 || parsedPaid > 0 || newPatientNotes.trim()) ? [{
        id: generateId(),
        date: getCurrentDate(),
        procedure: newPatientNotes.trim() ? newPatientNotes.trim() : 'دفعة أولى / فتح ملف',
        cost: parsedCost,
        paid: parsedPaid,
        labCost: 0,
        notes: ''
      }] : []
    };

    setPatients([newPatient, ...patients]);
    setName(''); setCost(''); setPaid(''); setNewPatientNotes(''); 
    setNewPatientAge(''); setNewPatientDob(''); setNewPatientPhone(''); setNewPatientGender(''); 
    setNewPatientComplaint(''); setNewPatientDiagnosis(''); setShowNewNotes(false);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleDeletePatient = (id: string) => {
    showConfirm('هل أنت متأكد من حذف هذا المريض نهائياً؟', () => {
      setPatients(prev => prev.filter(p => p.id !== id));
      setSelectedPatient(null);
      setIsEditingPatientDetails(false);
    });
  };

  const updatePatient = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setSelectedPatient(updatedPatient);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditingPatientDetails(false);
    setIsHistoryExpanded(false);
  };

  const clickAttemptsRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handlePatientDetailClick = () => {
    if (isEditingPatientDetails) return;
    const now = Date.now();
    if (now - lastClickTimeRef.current <= 5000) {
      clickAttemptsRef.current += 1;
      if (clickAttemptsRef.current >= 2) {
        setHighlightEditBtn(true);
        setTimeout(() => setHighlightEditBtn(false), 800);
        clickAttemptsRef.current = 0;
      }
    } else {
      clickAttemptsRef.current = 1;
    }
    lastClickTimeRef.current = now;
  };

  const originalPatient = selectedPatient ? patients.find(p => p.id === selectedPatient.id) : null;
  
  const isPatientDetailsModified = originalPatient && selectedPatient && (
    selectedPatient.age !== originalPatient.age ||
    selectedPatient.dateOfBirth !== originalPatient.dateOfBirth ||
    selectedPatient.phone !== originalPatient.phone ||
    selectedPatient.gender !== originalPatient.gender ||
    selectedPatient.complaint !== originalPatient.complaint ||
    selectedPatient.diagnosis !== originalPatient.diagnosis
  );

  const handleSavePatientDetails = () => {
    if (selectedPatient) {
      setPatients(prev => prev.map(p => p.id === selectedPatient.id ? selectedPatient : p));
      setIsEditingPatientDetails(false);
    }
  };

  const handleStatusChange = (newStatus: 'ongoing' | 'done' | 'postponed' | 'canceled' | 'transferred') => {
    if (!selectedPatient) return;

    if (selectedPatient.status === newStatus) {
      setShowStatusDetails(!showStatusDetails);
      return;
    }

    const updatedPatient = { ...selectedPatient, status: newStatus };
    setSelectedPatient(updatedPatient);
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setShowStatusDetails(true);
  };

  const handleCancelPatientDetails = () => {
    if (originalPatient && selectedPatient) {
      setSelectedPatient({
        ...selectedPatient,
        name: originalPatient.name,
        age: originalPatient.age,
        dateOfBirth: originalPatient.dateOfBirth,
        phone: originalPatient.phone,
        gender: originalPatient.gender,
        complaint: originalPatient.complaint,
        diagnosis: originalPatient.diagnosis
      });
    }
    setIsEditingPatientDetails(false);
    setIsEditingName(false);
  };

  const handleAddSession = () => {
    if (!selectedPatient) return;
    if (!sessionProcedure.trim()) { showAlert('يرجى كتابة نوع الإجراء.'); return; }
    
    const costAmt = parseFloat(sessionCost) || 0;
    const paidAmt = parseFloat(sessionPaid) || 0;

    if (editingVisitId) {
      const oldVisit = selectedPatient.visits.find(v => v.id === editingVisitId);
      if (!oldVisit) return;
      const costDiff = costAmt - (oldVisit.cost || 0);
      const paidDiff = paidAmt - (oldVisit.paid || 0);

      const updatedVisits = selectedPatient.visits.map(v => 
        v.id === editingVisitId ? { ...v, procedure: sessionProcedure, cost: costAmt, paid: paidAmt, notes: sessionNotes } : v
      );

      const newTotalCost = (parseFloat(selectedPatient.cost as any) || 0) + costDiff;
      const newTotalPaid = (parseFloat(selectedPatient.paid as any) || 0) + paidDiff;

      updatePatient({
        ...selectedPatient,
        cost: newTotalCost,
        paid: newTotalPaid,
        remaining: newTotalCost - newTotalPaid,
        visits: updatedVisits
      });
      setEditingVisitId(null);
    } else {
      const newVisit: Visit = {
        id: generateId(),
        date: getFormattedDate(),
        procedure: sessionProcedure,
        cost: costAmt,
        paid: paidAmt,
        labCost: 0,
        notes: sessionNotes,
        isFinancial: false
      };

      const newTotalCost = (parseFloat(selectedPatient.cost as any) || 0) + costAmt;
      const newTotalPaid = (parseFloat(selectedPatient.paid as any) || 0) + paidAmt;

      updatePatient({
        ...selectedPatient,
        cost: newTotalCost,
        paid: newTotalPaid,
        remaining: newTotalCost - newTotalPaid,
        visits: [newVisit, ...selectedPatient.visits]
      });
    }

    setSessionProcedure(''); setSessionCost(''); setSessionPaid(''); setSessionNotes(''); setShowSessionDetails(false);
  };

  // دالة تنفيذ العمليات المالية (الخصم، المعمل، الرسوم، الاسترداد)
  const executeFinancialAction = () => {
    if (!selectedPatient) return;
    const amt = parseFloat(finAmount) || 0;
    if (amt <= 0) { showAlert('يرجى إدخال مبلغ صحيح.'); return; }

    let newCost = parseFloat(selectedPatient.cost as any) || 0;
    let newPaid = parseFloat(selectedPatient.paid as any) || 0;

    let oldVisit: Visit | undefined;
    if (editingVisitId) {
      oldVisit = selectedPatient.visits.find(v => v.id === editingVisitId);
      if (oldVisit) {
        newCost -= (oldVisit.cost || 0);
        newPaid -= (oldVisit.paid || 0);
      }
    }

    let actionName = '';
    let visitCost = 0;
    let visitPaid = 0;
    let labAmt = 0;

    if (financialAction === 'discount') {
      const appliedAmt = Math.min(amt, newCost); // لا يمكن خصم مبلغ أكبر من التكلفة
      if (appliedAmt <= 0) { showAlert('لا يوجد تكلفة كافية لخصمها.'); return; }
      newCost -= appliedAmt;
      visitCost = -appliedAmt;
      actionName = 'خصم مالي';
    } else if (financialAction === 'fee') {
      newCost += amt;
      visitCost = amt;
      actionName = 'رسوم إضافية';
    } else if (financialAction === 'refund') {
      const appliedAmt = Math.min(amt, newPaid); // لا يمكن استرداد مبلغ أكبر من المدفوع
      if (appliedAmt <= 0) { showAlert('لا يوجد مبلغ مدفوع كافٍ لإرجاعه.'); return; }
      newPaid -= appliedAmt;
      visitPaid = -appliedAmt;
      actionName = 'استرداد مالي للمريض';
    } else if (financialAction === 'lab') {
      labAmt = amt;
      actionName = 'حساب معمل';
    } else if (financialAction === 'payment') {
      newPaid += amt;
      visitPaid = amt;
      actionName = 'دفعة مالية';
    }

    let finalNote = finNote;
    if (financialAction === 'lab' && finLabWorkType) {
      finalNote = finNote ? `${finNote} - نوع العمل: ${finLabWorkType}` : `نوع العمل: ${finLabWorkType}`;
    }

    if (editingVisitId) {
      const updatedVisits = selectedPatient.visits.map(v => 
        v.id === editingVisitId ? { ...v, cost: visitCost, paid: visitPaid, labCost: labAmt, notes: finalNote, procedure: actionName } : v
      );
      updatePatient({
        ...selectedPatient,
        cost: newCost,
        paid: newPaid,
        remaining: newCost - newPaid,
        visits: updatedVisits
      });
      setEditingVisitId(null);
      setFinancialAction(null); setFinAmount(''); setFinNote(''); setFinLabWorkType('');
      return;
    }

    const newVisit: Visit = {
      id: generateId(),
      date: getFormattedDate(),
      procedure: actionName,
      cost: visitCost,
      paid: visitPaid,
      labCost: labAmt,
      notes: finalNote,
      isFinancial: true,
      type: financialAction || undefined
    };

    updatePatient({
      ...selectedPatient,
      cost: newCost,
      paid: newPaid,
      remaining: newCost - newPaid,
      visits: [newVisit, ...selectedPatient.visits]
    });

    setFinancialAction(null); setFinAmount(''); setFinNote(''); setFinLabWorkType(''); setShowFinancialMenu(false);
  };

  const handleDeleteSession = (visitId: string, isFinancial?: boolean) => {
    if (!selectedPatient) return;
    const confirmMsg = isFinancial ? 'هل أنت متأكد من التراجع عن هذه العملية المالية واستعادة الحسابات السابقة؟' : 'هل أنت متأكد من حذف هذه الجلسة؟';
    showConfirm(confirmMsg, () => {
      const visit = selectedPatient.visits.find(v => v.id === visitId);
      if (!visit) return;

      let newCost = (parseFloat(selectedPatient.cost as any) || 0) - (visit.cost || 0);
      let newPaid = (parseFloat(selectedPatient.paid as any) || 0) - (visit.paid || 0);

      updatePatient({
        ...selectedPatient,
        cost: newCost,
        paid: newPaid,
        remaining: newCost - newPaid,
        visits: selectedPatient.visits.filter(v => v.id !== visitId)
      });
    });
  };

  const handleEditSession = (visit: Visit) => {
    if (visit.isFinancial) {
      setEditingVisitId(visit.id);
      setFinancialAction(visit.type || '');
      
      if (visit.type === 'lab') {
        setFinAmount(visit.labCost ? visit.labCost.toString() : '');
        let parsedNote = '';
        let parsedWorkType = '';
        if (visit.notes) {
          const parts = visit.notes.split(' - نوع العمل: ');
          if (parts.length === 2) {
            parsedNote = parts[0];
            parsedWorkType = parts[1];
          } else if (visit.notes.startsWith('نوع العمل: ')) {
            parsedWorkType = visit.notes.replace('نوع العمل: ', '');
          } else {
            parsedNote = visit.notes;
          }
        }
        setFinNote(parsedNote);
        setFinLabWorkType(parsedWorkType);
      } else {
        const amt = visit.cost ? Math.abs(visit.cost) : (visit.paid ? Math.abs(visit.paid) : 0);
        setFinAmount(amt ? amt.toString() : '');
        setFinNote(visit.notes || '');
        setFinLabWorkType('');
      }

      setTimeout(() => {
        const finBox = document.getElementById('financial-edit-box');
        if (finBox) {
          finBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const container = document.getElementById('patient-modal-scroll');
          if (container) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      }, 100);
      
      return;
    }
    setEditingVisitId(visit.id);
    setSessionProcedure(visit.procedure);
    setSessionCost(visit.cost ? visit.cost.toString() : '');
    setSessionPaid(visit.paid ? visit.paid.toString() : '');
    setSessionNotes(visit.notes || '');
    setShowSessionDetails(!!visit.notes);
    
    // التمرير مباشرة إلى قسم إضافة/تعديل البيانات وتنشيط الحقل
    setTimeout(() => {
      const editBox = document.getElementById('session-edit-box');
      if (editBox) {
        editBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const container = document.getElementById('patient-modal-scroll');
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const getPatientLabCost = (patient: Patient) => {
    return patient.visits?.reduce((sum, v) => sum + (parseFloat(v.labCost as any) || 0), 0) || 0;
  };

  const totalSystemCost = patients.reduce((sum, p) => sum + (parseFloat(p.cost as any) || 0), 0);
  const totalSystemPaid = patients.reduce((sum, p) => sum + (parseFloat(p.paid as any) || 0), 0);
  const totalSystemRemaining = patients.reduce((sum, p) => sum + (parseFloat(p.remaining as any) || 0), 0);
  const totalSystemLabCost = patients.reduce((sum, p) => sum + getPatientLabCost(p), 0);

  const currentMonthWithdrawals = withdrawals.filter(w => w.date.includes(new Date().toLocaleDateString('ar-EG', { month: 'long' })));
  const totalMonthWithdrawals = currentMonthWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  const currentMonthExpenses = expenses.filter(e => e.date.includes(new Date().toLocaleDateString('ar-EG', { month: 'long' })));
  const totalMonthExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      showAlert('يرجى إدخال مبلغ صحيح للسحب.');
      return;
    }
    const newWithdrawal: Withdrawal = {
      id: generateId(),
      amount,
      date: getFormattedDate(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      note: withdrawalNote.trim()
    };
    setWithdrawals([newWithdrawal, ...withdrawals]);
    setWithdrawalAmount('');
    setWithdrawalNote('');
  };

  const handleDeleteWithdrawal = (id: string) => {
    showConfirm('هل أنت متأكد من حذف عملية السحب هذه؟', () => {
      setWithdrawals(prev => prev.filter(w => w.id !== id));
    });
  };

  const handleAddExpense = () => {
    const amount = parseFloat(expenseAmount);
    if (!amount || amount <= 0) {
      showAlert('يرجى إدخال مبلغ صحيح للصرفية.');
      return;
    }
    const newExpense: Expense = {
      id: generateId(),
      amount,
      date: getFormattedDate(),
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      note: expenseNote.trim()
    };
    setExpenses([newExpense, ...expenses]);
    setExpenseAmount('');
    setExpenseNote('');
  };

  const handleDeleteExpense = (id: string) => {
    showConfirm('هل أنت متأكد من حذف هذه الصرفية؟', () => {
      setExpenses(prev => prev.filter(e => e.id !== id));
    });
  };

  const moveItem = (index: number, direction: number) => {
    const newPatients = [...patients];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newPatients.length) {
      [newPatients[index], newPatients[targetIndex]] = [newPatients[targetIndex], newPatients[index]];
      setPatients(newPatients);
    }
  };

  const getMonthKey = (timestamp: number) => {
    if (!timestamp) return 'غير محدد';
    return new Date(timestamp).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  };
  const availableMonths = [...new Set(patients.map(p => getMonthKey(p.timestamp)))];

  let displayPatients = patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  if (selectedMonth !== 'all') displayPatients = displayPatients.filter(p => getMonthKey(p.timestamp) === selectedMonth);
  if (statusFilter !== 'all') {
    if (statusFilter === 'none') {
      displayPatients = displayPatients.filter(p => !p.status);
    } else {
      displayPatients = displayPatients.filter(p => p.status === statusFilter);
    }
  }

  if (sortBy !== 'custom') {
    displayPatients.sort((a, b) => {
      let valA = sortBy === 'cost' ? a.cost : sortBy === 'paid' ? a.paid : sortBy === 'remaining' ? a.remaining : (a.timestamp || 0);
      let valB = sortBy === 'cost' ? b.cost : sortBy === 'paid' ? b.paid : sortBy === 'remaining' ? b.remaining : (b.timestamp || 0);
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });
  }

  const getReportData = () => {
    switch(reportModalType) {
      case 'debts': return patients.filter(p => (p.remaining||0) > 0).map(p => ({...p, val: formatCurrency(p.remaining), label: 'متبقي'}));
      case 'paid': return patients.filter(p => (p.paid||0) > 0).map(p => ({...p, val: formatCurrency(p.paid), label: 'دفع'}));
      case 'cost': return patients.filter(p => (p.cost||0) > 0).map(p => ({...p, val: formatCurrency(p.cost), label: 'تكلفة'}));
      case 'lab': return patients.filter(p => getPatientLabCost(p) > 0).map(p => ({...p, val: formatCurrency(getPatientLabCost(p)), label: 'معمل'}));
      case 'withdrawals': return withdrawals.map(w => ({id: w.id, name: w.note || 'سحب نقدي', val: formatCurrency(w.amount), label: 'سحب', date: w.date, time: w.time, isNonPatient: true}));
      case 'expenses': return expenses.map(e => ({id: e.id, name: e.note || 'مصروفات عامة', val: formatCurrency(e.amount), label: 'مصروف', date: e.date, time: e.time, isNonPatient: true}));
      default: return [];
    }
  };
  const reportData = getReportData();

  return (
    <div dir="rtl" className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-[#f8f9fc] text-gray-900'} font-sans text-right flex justify-center selection:bg-indigo-100 transition-colors duration-300`}>
      <div className={`w-full max-w-md ${isDarkMode ? 'bg-gray-800' : 'bg-white dark:bg-gray-800'} min-h-screen relative shadow-2xl overflow-hidden flex flex-col transition-colors duration-300`}>
        
        <header className="bg-[#5a55d2] text-white py-3 px-4 rounded-b-3xl shadow-lg z-50 relative shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold flex items-center gap-1">إدارة عيادة الأسنان 🦷</h1>
            <div className="relative">
              <button onClick={() => setShowAppSettings(!showAppSettings)} className="bg-white/20 dark:bg-gray-800/20 p-1.5 rounded-xl backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors">
                <MoreVertical size={20} className="text-white" />
              </button>
              {showAppSettings && (
                <>
                  <div className="fixed inset-0 z-[105]" onClick={() => setShowAppSettings(false)}></div>
                  <div className="absolute left-0 top-10 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 z-[110] flex flex-col gap-0.5 animate-fade-in text-gray-800 dark:text-gray-200">
                    <button onClick={() => {setIsDarkMode(!isDarkMode); setShowAppSettings(false);}} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {isDarkMode ? <Sun size={14} className="text-amber-400"/> : <Moon size={14} className="text-indigo-500" />}
                      {isDarkMode ? 'الوضع المضيء' : 'الوضع المظلم'}
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-0.5"></div>
                    <button onClick={handleExportData} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Download size={14} className="text-emerald-500" /> تصدير البيانات
                    </button>
                    <button onClick={() => { fileInputRef.current?.click(); setShowAppSettings(false); }} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Upload size={14} className="text-blue-500" /> استيراد البيانات
                    </button>
                  </div>
                </>
              )}
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleImportData} 
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 -mt-4 pb-20 z-20">
          
          {/* إضافة مريض */}
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 mt-6 relative">
            <h2 className="absolute -top-3 right-4 bg-white dark:bg-gray-800 px-2.5 py-0.5 text-[10px] font-bold text-[#5a55d2] dark:text-indigo-400 flex items-center gap-1 rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm z-10">
              <User size={12} /> إضافة مريض جديد
            </h2>
            <div className="flex gap-2 mb-3 pt-1">
              <div className="relative flex-1">
                <User className="absolute right-3 top-2.5 text-gray-400 dark:text-gray-500 z-10" size={16} />
                <input 
                  id="patientName"
                  type="text" placeholder="إسم المريض..." value={name} onChange={(e) => setName(e.target.value)}
                  className="peer w-full border border-gray-200 dark:border-gray-600 rounded-xl py-2 pr-9 pl-3 text-sm text-gray-700 dark:text-gray-200 bg-transparent dark:text-white focus:outline-none focus:border-[#5a55d2] placeholder-transparent"
                />
                <label htmlFor="patientName" className="absolute right-8 px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-white dark:bg-gray-800 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-white peer-focus:dark:bg-gray-800 after:content-['...'] after:opacity-0 peer-placeholder-shown:after:opacity-100 peer-focus:after:opacity-0">إسم المريض</label>
              </div>
              <button onClick={handleAddPatient} disabled={isAdding} className="w-12 h-[38px] flex shrink-0 justify-center items-center rounded-xl bg-[#5a55d2] hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-75" title="إضافة مريض">
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-700 items-stretch mb-3">
              <div className="flex-1 relative">
                <span className="absolute -top-3 right-2 bg-white dark:bg-gray-800 px-1 text-[9px] font-bold text-gray-400 dark:text-gray-500">التكلفة</span>
                <input type="text" inputMode="decimal" value={cost} onChange={(e) => setCost(parseAmount(e.target.value))} className="w-full border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl py-1.5 px-2 text-center text-sm text-gray-700 dark:text-gray-200 font-bold focus:outline-none focus:border-[#5a55d2]" placeholder="0" />
              </div>
              <div className="flex-1 relative">
                <span className="absolute -top-3 right-2 bg-white dark:bg-gray-800 px-1 text-[9px] font-bold text-[#5a55d2] dark:text-indigo-400">المدفوع</span>
                <input type="text" inputMode="decimal" value={paid} onChange={(e) => setPaid(parseAmount(e.target.value))} className="w-full border border-[#5a55d2] dark:border-indigo-500 bg-[#f8f7ff] dark:bg-indigo-900/20 dark:text-indigo-300 rounded-xl py-1.5 px-2 text-center text-sm text-[#5a55d2] dark:text-indigo-400 font-bold focus:outline-none" placeholder="0" />
              </div>
              <div className="flex-1 relative">
                <span className="absolute -top-3 right-2 bg-white dark:bg-gray-800 px-1 text-[9px] font-bold text-amber-500 dark:text-amber-400">المتبقي</span>
                <div className="w-full bg-[#fffcf5] dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/50 rounded-xl py-1.5 flex justify-center items-center h-full text-amber-500 dark:text-amber-400 font-bold text-sm">{formatCurrency((parseFloat(cost)||0)-(parseFloat(paid)||0))}</div>
              </div>
              <div className="relative shrink-0 flex">
                <button onClick={() => setShowNewNotes(!showNewNotes)} className={`w-12 border rounded-xl flex justify-center items-center transition-colors shadow-sm ${showNewNotes ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`} title="إضافة تفاصيل">
                  <FileText size={16} />
                </button>
              </div>
            </div>

            {showNewNotes && (
              <div className="flex flex-col gap-2 animate-fade-in pt-3 border-t border-gray-50 dark:border-gray-700">
                <div className="relative w-full">
                  <textarea id="newPatientNotes" placeholder="تفاصيل الإجراء أو ملاحظات..." value={newPatientNotes} onChange={(e) => setNewPatientNotes(e.target.value)} rows={1} className="peer w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 focus:border-[#5a55d2] outline-none resize-none placeholder-transparent" />
                  <label htmlFor="newPatientNotes" className="absolute right-2 px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-white dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-white peer-focus:dark:bg-gray-800 after:content-['...'] after:opacity-0 peer-placeholder-shown:after:opacity-100 peer-focus:after:opacity-0">تفاصيل الإجراء أو ملاحظات</label>
                </div>
                
                <div className="flex gap-1.5">
                  <div className="flex border border-gray-200 dark:border-gray-600 rounded-xl bg-transparent dark:bg-gray-800 focus-within:border-[#5a55d2] focus-within:ring-1 focus-within:ring-[#5a55d2] transition-all">
                    <div className="relative w-12 border-l border-gray-200 dark:border-gray-600">
                      <input id="newPatientAge" type="number" placeholder="العمر" value={newPatientAge} onChange={(e) => handleNewPatientAgeChange(e.target.value)} className="peer w-full text-xs bg-transparent dark:text-white rounded-r-xl p-2 text-center outline-none placeholder-transparent" />
                      <label htmlFor="newPatientAge" className="absolute right-0 left-0 mx-auto w-fit px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-white dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-white peer-focus:dark:bg-gray-800 z-20">العمر</label>
                    </div>
                    <div className="relative w-16">
                      <input id="newPatientDob" type="number" placeholder="سنة الميلاد" value={newPatientDob} onChange={(e) => handleNewPatientDobChange(e.target.value)} className="peer w-full text-xs bg-transparent dark:text-white rounded-l-xl p-2 text-center outline-none placeholder-transparent" />
                      <label htmlFor="newPatientDob" className="absolute right-0 left-0 mx-auto w-fit px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-white dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-white peer-focus:dark:bg-gray-800 z-20">الميلاد</label>
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <input id="newPatientPhone" type="tel" placeholder="رقم الهاتف" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} className="peer w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 text-center focus:border-[#5a55d2] outline-none placeholder-transparent" />
                    <label htmlFor="newPatientPhone" className="absolute right-0 left-0 mx-auto w-fit px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-white dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-white peer-focus:dark:bg-gray-800">رقم الهاتف</label>
                  </div>
                  <div className="flex w-24 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                    <button onClick={() => setNewPatientGender('ذكر')} className={`flex-1 py-2 text-xs font-bold transition-colors ${newPatientGender === 'ذكر' ? 'bg-blue-500 dark:bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>ذكر</button>
                    <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                    <button onClick={() => setNewPatientGender('أنثى')} className={`flex-1 py-2 text-xs font-bold transition-colors ${newPatientGender === 'أنثى' ? 'bg-pink-500 dark:bg-pink-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>أنثى</button>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <input id="newPatientComplaint" type="text" placeholder="شكوى المريض..." value={newPatientComplaint} onChange={(e) => setNewPatientComplaint(e.target.value)} className="peer w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 focus:border-[#5a55d2] outline-none placeholder-transparent" />
                    <label htmlFor="newPatientComplaint" className="absolute right-2 px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-white dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-white peer-focus:dark:bg-gray-800 after:content-['...'] after:opacity-0 peer-placeholder-shown:after:opacity-100 peer-focus:after:opacity-0">شكوى المريض</label>
                  </div>
                  <div className="relative flex-1">
                    <input id="newPatientDiagnosis" type="text" placeholder="التشخيص..." value={newPatientDiagnosis} onChange={(e) => setNewPatientDiagnosis(e.target.value)} className="peer w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 focus:border-[#5a55d2] outline-none placeholder-transparent" />
                    <label htmlFor="newPatientDiagnosis" className="absolute right-2 px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-white dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-white peer-focus:dark:bg-gray-800 after:content-['...'] after:opacity-0 peer-placeholder-shown:after:opacity-100 peer-focus:after:opacity-0">التشخيص</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* شريط الأدوات السريعة */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1 w-full">
            <button 
              onClick={() => { setShowReports(!showReports); setShowCalculator(false); setShowWithdrawals(false); setShowExpenses(false); }}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap shadow-sm border ${showReports ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-700'}`}
            >
              <BarChart2 size={14} /> 
              التقارير المالية
            </button>
            <button 
              onClick={() => { setShowCalculator(!showCalculator); setShowReports(false); setShowWithdrawals(false); setShowExpenses(false); }}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap shadow-sm border ${showCalculator ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-700'}`}
            >
              <Percent size={14} /> 
              حاسبة النسبة
            </button>
            <button 
              onClick={() => { setShowWithdrawals(!showWithdrawals); setShowReports(false); setShowCalculator(false); setShowExpenses(false); }}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap shadow-sm border ${showWithdrawals ? 'bg-teal-500 text-white border-teal-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-700'}`}
            >
              <Wallet size={14} /> 
              سحبيات
            </button>
            <button 
              onClick={() => { setShowExpenses(!showExpenses); setShowReports(false); setShowCalculator(false); setShowWithdrawals(false); }}
              className={`flex shrink-0 items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium transition-colors whitespace-nowrap shadow-sm border ${showExpenses ? 'bg-purple-500 text-white border-purple-500' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-700'}`}
            >
              <ShoppingCart size={14} /> 
              صرفيات
            </button>
          </div>

          {/* قسم التقارير المالية (مخفي افتراضياً) */}
          {showReports && (
            <div className="animate-fade-in mb-5">
              <div className="bg-[#f0f2fb] dark:bg-gray-800/50 p-3 rounded-2xl border border-[#e2e6fa] dark:border-gray-700">
                <div className="grid grid-cols-3 gap-2">
                  <div onClick={() => setReportModalType('cost')} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-center flex flex-col justify-center transition-colors">
                    <p className="text-[9px] text-gray-600 dark:text-gray-300 font-bold mb-0.5 flex justify-center items-center gap-1">التكلفة <Info size={10} /></p>
                    <p className="text-sm font-black text-gray-800 dark:text-gray-100">{formatCurrency(totalSystemCost)}</p>
                  </div>
                  <div onClick={() => setReportModalType('paid')} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-center flex flex-col justify-center transition-colors">
                    <p className="text-[9px] text-[#5a55d2] dark:text-indigo-400 font-bold mb-0.5 flex justify-center items-center gap-1">المدفوعات <Info size={10} /></p>
                    <p className="text-sm font-black text-[#5a55d2] dark:text-indigo-400">{formatCurrency(totalSystemPaid)}</p>
                  </div>
                  <div onClick={() => setReportModalType('debts')} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-center flex flex-col justify-center transition-colors">
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold mb-0.5 flex justify-center items-center gap-1">المتبقي <Info size={10} /></p>
                    <p className="text-sm font-black text-amber-600 dark:text-amber-400">{formatCurrency(totalSystemRemaining)}</p>
                  </div>
                  <div onClick={() => setReportModalType('lab')} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-center flex flex-col justify-center transition-colors">
                    <p className="text-[9px] text-red-500 font-bold mb-0.5 flex justify-center items-center gap-1">المعامل <Info size={10} /></p>
                    <p className="text-sm font-black text-red-500">{formatCurrency(totalSystemLabCost)}</p>
                  </div>
                  <div onClick={() => setReportModalType('withdrawals')} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-center flex flex-col justify-center transition-colors">
                    <p className="text-[9px] text-teal-600 dark:text-teal-400 font-bold mb-0.5 flex justify-center items-center gap-1">السحبيات <Info size={10} /></p>
                    <p className="text-sm font-black text-teal-600 dark:text-teal-400">{formatCurrency(totalMonthWithdrawals)}</p>
                  </div>
                  <div onClick={() => setReportModalType('expenses')} className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-center flex flex-col justify-center transition-colors">
                    <p className="text-[9px] text-purple-600 dark:text-purple-400 font-bold mb-0.5 flex justify-center items-center gap-1">الصرفيات <Info size={10} /></p>
                    <p className="text-sm font-black text-purple-600 dark:text-purple-400">{formatCurrency(totalMonthExpenses)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* حاسبة النسبة المتطورة */}
          {showCalculator && (
            <div className="animate-fade-in mb-5">
              <div className="bg-[#f0f2fb] dark:bg-gray-800/50 p-3 rounded-2xl border border-[#e2e6fa] dark:border-gray-700 flex flex-col gap-3">
                {/* نسخة مصغرة من التفاصيل المالية */}
                <div className="flex items-center justify-between gap-1 bg-white dark:bg-gray-800 p-2 rounded-xl border border-indigo-50 dark:border-indigo-900/50 shadow-sm">
                  <div className="flex flex-col items-center flex-1 border-l border-gray-100 dark:border-gray-700">
                    <span className="text-[8px] text-gray-400 dark:text-gray-500 font-bold">التكلفة</span>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-200">{formatCurrency(totalSystemCost)}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 border-l border-gray-100 dark:border-gray-700">
                    <span className="text-[8px] text-[#5a55d2] dark:text-indigo-400 font-bold">المدفوعات</span>
                    <span className="text-[11px] font-bold text-[#5a55d2] dark:text-indigo-400">{formatCurrency(totalSystemPaid)}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 border-l border-gray-100 dark:border-gray-700">
                    <span className="text-[8px] text-amber-500 dark:text-amber-400 font-bold">المتبقي</span>
                    <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400">{formatCurrency(totalSystemRemaining)}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[8px] text-red-500 dark:text-red-400 font-bold">المعمل</span>
                    <span className="text-[11px] font-bold text-red-500 dark:text-red-400">{formatCurrency(totalSystemLabCost)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Percent size={14} className="text-[#5a55d2] dark:text-indigo-400" />
                    <input type="number" value={calcPercent} onChange={(e) => setCalcPercent(e.target.value)} className="w-10 text-center text-sm font-bold text-[#5a55d2] dark:text-indigo-400 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 rounded-lg py-1 focus:outline-none" />
                  </div>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {[30, 40, 50, 60].map(pct => (
                      <button key={pct} onClick={() => setCalcPercent(pct.toString())} className={`px-2 py-1 rounded-lg text-[10px] font-bold ${calcPercent === pct.toString() ? 'bg-white dark:bg-gray-700 text-[#5a55d2] dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'}`}>{pct}%</button>
                    ))}
                  </div>
                  <div className="bg-[#10b981] text-white rounded-lg px-3 py-1.5 flex justify-center items-center ml-1 flex-shrink-0 min-w-[90px] w-[100px]">
                    <span className="text-sm font-black whitespace-nowrap">{formatCurrency((((calcFromTotal ? totalSystemCost : calcFromRemaining ? totalSystemRemaining : totalSystemPaid) - (deductLabCost ? totalSystemLabCost : 0)) * (parseFloat(calcPercent) || 0) / 100) - (deductWithdrawals ? totalMonthWithdrawals : 0))}</span>
                  </div>
                </div>
                
                {/* صف التحكم (Toggles) */}
                <div className="flex gap-1">
                   <button 
                     onClick={() => setDeductLabCost(!deductLabCost)} 
                     className={`flex-1 px-1 py-1.5 rounded-lg text-[8px] font-bold flex items-center justify-center gap-1 transition-colors border ${deductLabCost ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'}`}
                   >
                     <FlaskConical size={10} /> {deductLabCost ? 'تم الخصم' : 'خصم المعمل'}
                   </button>
                   <button 
                     onClick={() => { setCalcFromRemaining(!calcFromRemaining); if (!calcFromRemaining) setCalcFromTotal(false); }} 
                     className={`flex-1 px-1 py-1.5 rounded-lg text-[8px] font-bold flex items-center justify-center gap-1 transition-colors border ${calcFromRemaining ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'}`}
                   >
                     <Calculator size={10} /> {calcFromRemaining ? 'من المتبقي' : 'نسبة المتبقي'}
                   </button>
                   <button 
                     onClick={() => { setCalcFromTotal(!calcFromTotal); if (!calcFromTotal) setCalcFromRemaining(false); }} 
                     className={`flex-1 px-1 py-1.5 rounded-lg text-[8px] font-bold flex items-center justify-center gap-1 transition-colors border ${calcFromTotal ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-700' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'}`}
                   >
                     <Calculator size={10} /> {calcFromTotal ? 'من الإجمالي' : 'نسبة الإجمالي'}
                   </button>
                   <button 
                     onClick={() => setDeductWithdrawals(!deductWithdrawals)} 
                     className={`flex-1 px-1 py-1.5 rounded-lg text-[8px] font-bold flex items-center justify-center gap-1 transition-colors border ${deductWithdrawals ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200' : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'}`}
                   >
                     <Wallet size={10} /> {deductWithdrawals ? 'تم الخصم' : 'خصم السحبيات'}
                   </button>
                </div>
              </div>
            </div>
          )}

          {/* قسم السحبيات */}
          {showWithdrawals && (
            <div className="animate-fade-in mb-5">
              <div className="bg-[#f0f2fb] dark:bg-gray-800/50 p-3 rounded-2xl border border-[#e2e6fa] dark:border-gray-700 flex flex-col gap-3">
                
                {/* ملخص الشهر */}
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-teal-100 dark:border-teal-900/50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1">
                    <Calendar size={12} /> إجمالي سحبيات الشهر الحالي
                  </span>
                  <span className="text-sm font-black text-teal-600 dark:text-teal-500">{formatCurrency(totalMonthWithdrawals)}</span>
                </div>

                {/* إدخال سحب جديد */}
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="المبلغ" 
                    value={withdrawalAmount} 
                    onChange={(e) => setWithdrawalAmount(parseAmount(e.target.value))} 
                    className="w-20 text-xs border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 focus:border-[#5a55d2] outline-none text-center bg-white dark:bg-gray-800 dark:text-white" 
                  />
                  <input 
                    type="text" 
                    placeholder="ملاحظة (اختياري)" 
                    value={withdrawalNote} 
                    onChange={(e) => setWithdrawalNote(e.target.value)} 
                    className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 focus:border-[#5a55d2] outline-none bg-white dark:bg-gray-800 dark:text-white" 
                  />
                  <button 
                    onClick={handleAddWithdrawal}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex justify-center items-center gap-1 text-xs"
                  >
                    <Wallet size={12} /> تأكيد
                  </button>
                </div>

                {/* سجل السحبيات */}
                {withdrawals.length > 0 && (
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                    <h4 className="text-[9px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">سجل السحبيات</h4>
                    {withdrawals.map(w => (
                      <div key={w.id} className="flex justify-between items-center p-1.5 bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{formatCurrency(w.amount)}</span>
                          {w.note && <span className="text-[9px] text-gray-500 dark:text-gray-400">{w.note}</span>}
                          <span className="text-[8px] text-gray-400 dark:text-gray-500 mt-0.5">{w.date} - {w.time}</span>
                        </div>
                        <button onClick={() => handleDeleteWithdrawal(w.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* قسم الصرفيات */}
          {showExpenses && (
            <div className="animate-fade-in mb-5">
              <div className="bg-[#f0f2fb] dark:bg-gray-800/50 p-3 rounded-2xl border border-[#e2e6fa] dark:border-gray-700 flex flex-col gap-3">
                
                {/* ملخص الشهر */}
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-purple-100 dark:border-purple-900/50 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-purple-800 dark:text-purple-400 flex items-center gap-1">
                    <Calendar size={12} /> إجمالي الصرفيات (مواد ومستلزمات)
                  </span>
                  <span className="text-sm font-black text-purple-600 dark:text-purple-500">{formatCurrency(totalMonthExpenses)}</span>
                </div>

                {/* إدخال صرفية جديدة */}
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    inputMode="decimal"
                    placeholder="المبلغ" 
                    value={expenseAmount} 
                    onChange={(e) => setExpenseAmount(parseAmount(e.target.value))} 
                    className="w-20 text-xs border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 focus:border-[#5a55d2] outline-none text-center bg-white dark:bg-gray-800 dark:text-white" 
                  />
                  <input 
                    type="text" 
                    placeholder="ملاحظة (إسم المادة أو المشتريات)" 
                    value={expenseNote} 
                    onChange={(e) => setExpenseNote(e.target.value)} 
                    className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 focus:border-[#5a55d2] outline-none bg-white dark:bg-gray-800 dark:text-white" 
                  />
                  <button 
                    onClick={handleAddExpense}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex justify-center items-center gap-1 text-xs"
                  >
                    <ShoppingCart size={12} /> تأكيد
                  </button>
                </div>

                {/* سجل الصرفيات */}
                {expenses.length > 0 && (
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                    <h4 className="text-[9px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">سجل الصرفيات</h4>
                    {expenses.map(e => (
                      <div key={e.id} className="flex justify-between items-center p-1.5 bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{formatCurrency(e.amount)}</span>
                          {e.note && <span className="text-[9px] text-gray-500 dark:text-gray-400">{e.note}</span>}
                          <span className="text-[8px] text-gray-400 dark:text-gray-500 mt-0.5">{e.date} - {e.time}</span>
                        </div>
                        <button onClick={() => handleDeleteExpense(e.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* شريط البحث والفرز */}
          <div className="flex justify-between items-center mb-3 px-1 relative z-30 gap-2">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1 whitespace-nowrap">
              <List size={14} /> المرضى ({displayPatients.length})
            </h2>
            <div className="relative flex-1">
              <Search className="absolute right-2 top-[7px] text-gray-400 dark:text-gray-500" size={14} />
              <input type="text" placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg py-1.5 pr-7 pl-2 text-xs focus:outline-none focus:border-[#5a55d2]" />
            </div>
            <div className="flex items-center gap-1.5 relative">
              <button onClick={() => {setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); setShowMonthMenu(false);}} className={`p-1.5 rounded-lg border ${statusFilter !== 'all' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-[#5a55d2] dark:text-indigo-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}><Filter size={14} /></button>
              <button onClick={() => {setShowMonthMenu(!showMonthMenu); setShowSortMenu(false); setShowFilterMenu(false);}} className={`p-1.5 rounded-lg border ${selectedMonth !== 'all' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-[#5a55d2] dark:text-indigo-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}><Calendar size={14} /></button>
              <button onClick={() => {setShowSortMenu(!showSortMenu); setShowMonthMenu(false); setShowFilterMenu(false);}} className={`p-1.5 rounded-lg border ${sortBy !== 'date' || !sortDesc ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-[#5a55d2] dark:text-indigo-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400'}`}><ArrowUpDown size={14} /></button>
            
              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterMenu(false)}></div>
                  <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50 flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold px-2 py-1">فلترة حسب الحالة:</p>
                    {[
                      { id: 'all', label: 'الكل' }, 
                      { id: 'ongoing', label: 'مستمرة', icon: <Activity size={12} className="text-blue-500" /> }, 
                      { id: 'done', label: 'مكتملة', icon: <CheckCircle2 size={12} className="text-emerald-500" /> }, 
                      { id: 'postponed', label: 'مؤجلة', icon: <Clock size={12} className="text-amber-500" /> }, 
                      { id: 'transferred', label: 'محولة', icon: <ArrowRightLeft size={12} className="text-purple-500" /> },
                      { id: 'canceled', label: 'ملغية', icon: <XCircle size={12} className="text-red-500" /> }, 
                      { id: 'none', label: 'غير محددة', icon: <Activity size={12} className="text-gray-300 dark:text-gray-600" /> }
                    ].map(f => (
                      <button key={f.id} onClick={() => { setStatusFilter(f.id); setShowFilterMenu(false); }} className={`text-xs px-3 py-2 rounded-lg text-right flex justify-between items-center ${statusFilter === f.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-[#5a55d2] font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          {f.icon}
                          <span>{f.label}</span>
                        </div>
                        {statusFilter === f.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {showMonthMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMonthMenu(false)}></div>
                  <div className="absolute left-0 top-full mt-2 w-max min-w-[120px] max-w-[200px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50 flex flex-col gap-1">
                    <button onClick={() => { setSelectedMonth('all'); setShowMonthMenu(false); }} className={`text-xs px-3 py-2 rounded-lg text-right ${selectedMonth === 'all' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-[#5a55d2] font-bold' : 'text-gray-600 dark:text-gray-300'}`}>كل الأشهر</button>
                    {availableMonths.map(m => (
                      <button key={m} onClick={() => { setSelectedMonth(m); setShowMonthMenu(false); }} className={`text-xs px-3 py-2 rounded-lg text-right ${selectedMonth === m ? 'bg-indigo-50 dark:bg-indigo-900/30 text-[#5a55d2] font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{m}</button>
                    ))}
                  </div>
                </>
              )}
              {showSortMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)}></div>
                  <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50 flex flex-col gap-1">
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold px-2 py-1">ترتيب حسب:</p>
                    {[{ id: 'date', label: 'تاريخ الإضافة' }, { id: 'cost', label: 'التكلفة' }, { id: 'paid', label: 'المدفوع' }, { id: 'remaining', label: 'المتبقي' }, { id: 'custom', label: 'مخصص (يدوي)' }].map(s => (
                      <button key={s.id} onClick={() => { setSortBy(s.id); if(s.id === 'custom') setShowSortMenu(false); }} className={`text-xs px-3 py-2 rounded-lg text-right flex justify-between items-center ${sortBy === s.id ? 'bg-indigo-50 dark:bg-indigo-900/30 text-[#5a55d2] font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-700'}`}>
                        {s.label}
                        {sortBy === s.id && <Check size={14} />}
                      </button>
                    ))}
                    {sortBy !== 'custom' && (
                      <>
                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                        <button onClick={() => {setSortDesc(!sortDesc); setShowSortMenu(false);}} className="text-xs px-3 py-2 rounded-lg text-right flex justify-between items-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-700">
                          <span>{sortDesc ? 'تنازلي (الأعلى/الأحدث)' : 'تصاعدي (الأقل/الأقدم)'}</span>
                          <ArrowUpDown size={14} className="text-gray-400 dark:text-gray-500" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            {displayPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                <User size={64} className="mb-4 text-gray-300" strokeWidth={1.5} />
                <p className="text-lg font-bold mb-1 text-gray-500 dark:text-gray-400">لا يوجد مرضى حالياً</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">أضف مريضاً جديداً من الأعلى</p>
              </div>
            ) : (
              displayPatients.map((p, i) => (
                <PatientCard key={p.id} patient={p} index={i} total={displayPatients.length} isCustomSort={sortBy === 'custom'} onMoveUp={(idx) => moveItem(idx, -1)} onMoveDown={(idx) => moveItem(idx, 1)} onPress={handleSelectPatient} />
              ))
            )}
          </div>
        </main>

        {/* ==========================================
            نافذة تفاصيل المريض المتقدمة
        ========================================== */}
        {selectedPatient && (
          <div className="absolute inset-0 z-[100] bg-black/40 flex justify-center items-end sm:items-center sm:p-4 backdrop-blur-sm" onClick={() => { setSelectedPatient(null); setIsEditingPatientDetails(false); }}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh]" onClick={e => e.stopPropagation()}>
              
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-normal flex items-center gap-2 flex-1 pl-4 pt-1">
                  <User size={20} className="text-[#5a55d2] shrink-0" /> 
                  {isEditingName ? (
                    <div className="flex items-center gap-1 w-full">
                      <input 
                        type="text" 
                        value={selectedPatient.name} 
                        onChange={(e) => setSelectedPatient({...selectedPatient, name: e.target.value})}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm w-full outline-none focus:border-[#5a55d2]"
                        autoFocus
                      />
                      <button onClick={() => { setIsEditingName(false); handleSavePatientDetails(); }} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 shrink-0"><Check size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <span className="truncate">{selectedPatient.name || (!selectedPatient.id ? 'إضافة مريض جديد' : 'مريض بدون اسم')}</span>
                      <button onClick={() => setIsEditingName(true)} className="p-1 text-gray-400 hover:text-[#5a55d2] transition-colors shrink-0"><Edit2 size={14} /></button>
                    </div>
                  )}
                </h2>
                <button onClick={() => { setSelectedPatient(null); setIsEditingPatientDetails(false); setIsEditingName(false); }} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-600 shrink-0"><X size={18} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4" id="patient-modal-scroll">
                {/* تفاصيل المريض الإضافية */}
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl mb-4 border border-gray-100 dark:border-dashed dark:border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1"><User size={14} /> تفاصيل المريض</h3>
                    <div className="flex items-center gap-1">
                      {isPatientDetailsModified && (
                        <button onClick={handleSavePatientDetails} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors animate-fade-in">
                          <Check size={14} />
                        </button>
                      )}
                      <button onClick={() => isEditingPatientDetails ? handleCancelPatientDetails() : setIsEditingPatientDetails(true)} className={`p-1.5 rounded-lg transition-all ${isEditingPatientDetails ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'} ${highlightEditBtn ? 'ring-4 ring-indigo-300 dark:ring-indigo-600 scale-110 shadow-lg bg-indigo-100 dark:bg-indigo-800 text-indigo-600' : ''}`}>
                        {isEditingPatientDetails ? <X size={14} /> : <Edit2 size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div onClick={handlePatientDetailClick} className="flex flex-col gap-2">
                      <div className="flex gap-1.5">
                        <div className={`flex border border-gray-200 dark:border-gray-600 rounded-xl bg-transparent transition-all ${isEditingPatientDetails ? 'focus-within:border-[#5a55d2] focus-within:ring-1 focus-within:ring-[#5a55d2]' : 'opacity-80'}`}>
                        <div className="relative w-12 border-l border-gray-200 dark:border-gray-600">
                          <input id="selectedPatientAge" type="number" placeholder="العمر" value={selectedPatient.age || ''} onChange={(e) => handlePatientAgeChange(selectedPatient, e.target.value)} readOnly={!isEditingPatientDetails} className={`peer w-full text-xs bg-transparent dark:text-white rounded-r-xl p-2 text-center outline-none placeholder-transparent ${!isEditingPatientDetails ? 'pointer-events-none' : ''}`} />
                          <label htmlFor="selectedPatientAge" className="absolute right-0 left-0 mx-auto w-fit px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-gray-50 dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-gray-50 peer-focus:dark:bg-gray-800 z-20">العمر</label>
                        </div>
                        <div className="relative w-16">
                          <input id="selectedPatientDob" type="number" placeholder="سنة الميلاد" value={selectedPatient.dateOfBirth || ''} onChange={(e) => handlePatientDobChange(selectedPatient, e.target.value)} readOnly={!isEditingPatientDetails} className={`peer w-full text-xs bg-transparent dark:text-white rounded-l-xl p-2 text-center outline-none placeholder-transparent ${!isEditingPatientDetails ? 'pointer-events-none' : ''}`} />
                          <label htmlFor="selectedPatientDob" className="absolute right-0 left-0 mx-auto w-fit px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-gray-50 dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-gray-50 peer-focus:dark:bg-gray-800 z-20">الميلاد</label>
                        </div>
                      </div>
                      <div className={`relative flex-1 ${!isEditingPatientDetails ? 'opacity-80' : ''}`}>
                        <input id="selectedPatientPhone" type="tel" placeholder="رقم الهاتف" value={selectedPatient.phone || ''} onChange={(e) => setSelectedPatient({...selectedPatient, phone: e.target.value})} readOnly={!isEditingPatientDetails} className={`peer w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 text-center focus:border-[#5a55d2] outline-none placeholder-transparent ${!isEditingPatientDetails ? 'pointer-events-none' : ''}`} />
                        <label htmlFor="selectedPatientPhone" className="absolute right-0 left-0 mx-auto w-fit px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-gray-50 dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-gray-50 peer-focus:dark:bg-gray-800">رقم الهاتف</label>
                      </div>
                      <div className={`flex w-24 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden ${!isEditingPatientDetails ? 'opacity-80' : ''}`}>
                        <div className="flex-1 flex" onClick={(e) => { e.stopPropagation(); if (isEditingPatientDetails) { setSelectedPatient({...selectedPatient, gender: 'ذكر'}) } else { handlePatientDetailClick() } }}>
                          <button disabled={!isEditingPatientDetails} className={`w-full py-2 text-xs font-bold transition-colors pointer-events-none ${selectedPatient.gender === 'ذكر' ? 'bg-blue-500 dark:bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>ذكر</button>
                        </div>
                        <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                        <div className="flex-1 flex" onClick={(e) => { e.stopPropagation(); if (isEditingPatientDetails) { setSelectedPatient({...selectedPatient, gender: 'أنثى'}) } else { handlePatientDetailClick() } }}>
                          <button disabled={!isEditingPatientDetails} className={`w-full py-2 text-xs font-bold transition-colors pointer-events-none ${selectedPatient.gender === 'أنثى' ? 'bg-pink-500 dark:bg-pink-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>أنثى</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className={`relative flex-1 ${!isEditingPatientDetails ? 'opacity-80' : ''}`}>
                        <input id="selectedPatientComplaint" type="text" placeholder="شكوى المريض..." value={selectedPatient.complaint || ''} onChange={(e) => setSelectedPatient({...selectedPatient, complaint: e.target.value})} readOnly={!isEditingPatientDetails} className={`peer w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 focus:border-[#5a55d2] outline-none placeholder-transparent ${!isEditingPatientDetails ? 'pointer-events-none' : ''}`} />
                        <label htmlFor="selectedPatientComplaint" className="absolute right-2 px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-gray-50 dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-gray-50 peer-focus:dark:bg-gray-800 after:content-['...'] after:opacity-0 peer-placeholder-shown:after:opacity-100 peer-focus:after:opacity-0">شكوى المريض</label>
                      </div>
                      <div className={`relative flex-1 ${!isEditingPatientDetails ? 'opacity-80' : ''}`}>
                        <input id="selectedPatientDiagnosis" type="text" placeholder="التشخيص..." value={selectedPatient.diagnosis || ''} onChange={(e) => setSelectedPatient({...selectedPatient, diagnosis: e.target.value})} readOnly={!isEditingPatientDetails} className={`peer w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 focus:border-[#5a55d2] outline-none placeholder-transparent ${!isEditingPatientDetails ? 'pointer-events-none' : ''}`} />
                        <label htmlFor="selectedPatientDiagnosis" className="absolute right-2 px-1 transition-all duration-200 pointer-events-none text-gray-400 dark:text-gray-500 -top-2 text-[8px] bg-gray-50 dark:bg-gray-800 peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-placeholder-shown:bg-transparent peer-focus:-top-2 peer-focus:text-[8px] peer-focus:bg-gray-50 peer-focus:dark:bg-gray-800 after:content-['...'] after:opacity-0 peer-placeholder-shown:after:opacity-100 peer-focus:after:opacity-0">التشخيص</label>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 px-1">حالة المعالجة</span>
                    <div className="flex gap-1.5">
                      <div className="flex flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                        <button onClick={() => handleStatusChange('ongoing')} className={`flex-1 py-1.5 text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${selectedPatient.status === 'ongoing' || !selectedPatient.status ? 'bg-blue-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}><Activity size={10} /> مستمرة</button>
                          <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                          <button onClick={() => handleStatusChange('done')} className={`flex-1 py-1.5 text-[10px] font-bold transition-colors flex flex-col items-center justify-center relative ${selectedPatient.status === 'done' ? 'bg-emerald-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                            <div className="flex items-center gap-1"><CheckCircle2 size={10} /> مكتملة</div>
                            {selectedPatient.status === 'done' && (showStatusDetails ? <ChevronUp size={8} className="absolute bottom-[2px] opacity-80" strokeWidth={3} /> : <ChevronDown size={8} className="absolute bottom-[2px] opacity-80" strokeWidth={3} />)}
                          </button>
                          <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                          <button onClick={() => handleStatusChange('postponed')} className={`flex-1 py-1.5 text-[10px] font-bold transition-colors flex flex-col items-center justify-center relative ${selectedPatient.status === 'postponed' ? 'bg-amber-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                            <div className="flex items-center gap-1"><Clock size={10} /> مؤجلة</div>
                            {selectedPatient.status === 'postponed' && (showStatusDetails ? <ChevronUp size={8} className="absolute bottom-[2px] opacity-80" strokeWidth={3} /> : <ChevronDown size={8} className="absolute bottom-[2px] opacity-80" strokeWidth={3} />)}
                          </button>
                          <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                          <button onClick={() => handleStatusChange('transferred')} className={`flex-1 py-1.5 text-[10px] font-bold transition-colors flex flex-col items-center justify-center relative ${selectedPatient.status === 'transferred' ? 'bg-purple-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                            <div className="flex items-center gap-1"><ArrowRightLeft size={10} /> محولة</div>
                            {selectedPatient.status === 'transferred' && (showStatusDetails ? <ChevronUp size={8} className="absolute bottom-[2px] opacity-80" strokeWidth={3} /> : <ChevronDown size={8} className="absolute bottom-[2px] opacity-80" strokeWidth={3} />)}
                          </button>
                          <div className="w-px bg-gray-200 dark:bg-gray-600"></div>
                          <button onClick={() => handleStatusChange('canceled')} className={`flex-1 py-1.5 text-[10px] font-bold transition-colors flex flex-col items-center justify-center relative ${selectedPatient.status === 'canceled' ? 'bg-red-500 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                            <div className="flex items-center gap-1"><XCircle size={10} /> ملغية</div>
                            {selectedPatient.status === 'canceled' && (showStatusDetails ? <ChevronUp size={8} className="absolute bottom-[2px] opacity-80" strokeWidth={3} /> : <ChevronDown size={8} className="absolute bottom-[2px] opacity-80" strokeWidth={3} />)}
                          </button>
                        </div>
                      </div>

                      {selectedPatient.status === 'done' && showStatusDetails && (
                        <div className="mt-2 animate-fade-in bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/60 rounded-xl p-2 flex flex-col gap-2">
                          <div className="flex gap-2">
                            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/50 rounded-lg py-1.5 shadow-sm">
                              <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">تقييم المعالجة (Prognosis)</span>
                              <div className="flex gap-0.5" dir="ltr">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    size={16} 
                                    className={`cursor-pointer transition-all ${star <= (selectedPatient.prognosisRating || 0) ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-gray-300 dark:text-gray-600 hover:text-amber-200'}`} 
                                    onClick={() => {
                                      if (selectedPatient.prognosisRating === star) {
                                        const updated = { ...selectedPatient, prognosisRating: 0 };
                                        setSelectedPatient(updated);
                                        setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                                      } else {
                                        const updated = { ...selectedPatient, prognosisRating: star };
                                        setSelectedPatient(updated);
                                        setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                                      }
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/50 rounded-lg py-1.5 shadow-sm">
                              <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">رضى المريض</span>
                              <div className="flex gap-0.5" dir="ltr">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star} 
                                    size={16} 
                                    className={`cursor-pointer transition-all ${star <= (selectedPatient.patientSatisfaction || 0) ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-gray-300 dark:text-gray-600 hover:text-amber-200'}`} 
                                    onClick={() => {
                                      if (selectedPatient.patientSatisfaction === star) {
                                        const updated = { ...selectedPatient, patientSatisfaction: 0 };
                                        setSelectedPatient(updated);
                                        setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                                      } else {
                                        const updated = { ...selectedPatient, patientSatisfaction: star };
                                        setSelectedPatient(updated);
                                        setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                                      }
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Notes field for done status */}
                          <div className="flex-1 flex items-center bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-800/50 rounded-lg px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-emerald-200 dark:focus-within:ring-emerald-900/50 transition-all">
                            <FileText size={14} className="text-emerald-400 rtl:ml-2 ltr:mr-2 shrink-0" />
                            <input 
                              type="text" 
                              placeholder="ملاحظات.." 
                              value={selectedPatient.doneNotes || ''}
                              onChange={(e) => {
                                const updated = { ...selectedPatient, doneNotes: e.target.value };
                                setSelectedPatient(updated);
                                setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                                setNoteConfirmed(false);
                              }}
                              className="w-full bg-transparent border-none outline-none text-xs text-emerald-800 dark:text-emerald-300 placeholder-emerald-300 dark:placeholder-emerald-500/70"
                            />
                            {selectedPatient.doneNotes && selectedPatient.doneNotes.trim().length > 0 && !noteConfirmed && (
                              <Check 
                                size={14} 
                                className="text-emerald-500 shrink-0 rtl:mr-1 ltr:ml-1 animate-in zoom-in duration-200 cursor-pointer hover:text-emerald-600 transition-colors" 
                                onClick={() => setNoteConfirmed(true)}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {selectedPatient.status === 'postponed' && showStatusDetails && (
                        <div className="mt-2 animate-fade-in bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/60 rounded-xl p-2 flex gap-2">
                          <div className="flex-1 flex items-center bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800/50 rounded-lg px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-amber-200 dark:focus-within:ring-amber-900/50 transition-all">
                            <Calendar size={14} className="text-amber-500 rtl:ml-2 ltr:mr-2 shrink-0" />
                            <input 
                              type="text" 
                              placeholder="موعد الاستكمال..." 
                              value={selectedPatient.postponeDate || ''}
                              onChange={(e) => {
                                const updated = { ...selectedPatient, postponeDate: e.target.value };
                                setSelectedPatient(updated);
                                setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                              }}
                              className="w-full bg-transparent border-none outline-none text-xs text-amber-900 dark:text-amber-100 placeholder-amber-400/80 dark:placeholder-amber-600/70"
                            />
                          </div>
                          <div className="flex-1 flex items-center bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-800/50 rounded-lg px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-amber-200 dark:focus-within:ring-amber-900/50 transition-all">
                            <Clock size={14} className="text-amber-500 rtl:ml-2 ltr:mr-2 shrink-0" />
                            <input 
                              type="text" 
                              placeholder="سبب التأجيل..." 
                              value={selectedPatient.postponeReason || ''}
                              onChange={(e) => {
                                const updated = { ...selectedPatient, postponeReason: e.target.value };
                                setSelectedPatient(updated);
                                setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                              }}
                              className="w-full bg-transparent border-none outline-none text-xs text-amber-900 dark:text-amber-100 placeholder-amber-400/80 dark:placeholder-amber-600/70"
                            />
                          </div>
                        </div>
                      )}

                      {selectedPatient.status === 'transferred' && showStatusDetails && (
                        <div className="mt-2 animate-fade-in bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/60 rounded-xl p-2 flex gap-2">
                          <div className="flex-1 flex items-center bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800/50 rounded-lg px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-purple-200 dark:focus-within:ring-purple-900/50 transition-all">
                            <Stethoscope size={14} className="text-purple-400 rtl:ml-2 ltr:mr-2 shrink-0" />
                            <input 
                              type="text" 
                              placeholder="إسم الطبيب المحول إليه..." 
                              value={selectedPatient.transferDoctor || ''}
                              onChange={(e) => {
                                const updated = { ...selectedPatient, transferDoctor: e.target.value };
                                setSelectedPatient(updated);
                                setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                              }}
                              className="w-full bg-transparent border-none outline-none text-xs text-gray-800 dark:text-gray-100 placeholder-purple-300 dark:placeholder-purple-500/70"
                            />
                          </div>
                          <div className="flex-1 flex items-center bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800/50 rounded-lg px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-purple-200 dark:focus-within:ring-purple-900/50 transition-all">
                            <FileText size={14} className="text-purple-400 rtl:ml-2 ltr:mr-2 shrink-0" />
                            <input 
                              type="text" 
                              placeholder="سبب التحويل..." 
                              value={selectedPatient.transferReason || ''}
                              onChange={(e) => {
                                const updated = { ...selectedPatient, transferReason: e.target.value };
                                setSelectedPatient(updated);
                                setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                              }}
                              className="w-full bg-transparent border-none outline-none text-xs text-gray-800 dark:text-gray-100 placeholder-purple-300 dark:placeholder-purple-500/70"
                            />
                          </div>
                        </div>
                      )}

                      {selectedPatient.status === 'canceled' && showStatusDetails && (
                        <div className="mt-2 animate-fade-in bg-red-50/50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/60 rounded-xl p-2 flex">
                          <div className="flex-1 flex items-center bg-white dark:bg-gray-800 border border-red-100 dark:border-red-800/50 rounded-lg px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-red-200 dark:focus-within:ring-red-900/50 transition-all">
                            <Info size={14} className="text-red-400 rtl:ml-2 ltr:mr-2 shrink-0" />
                            <input 
                              type="text" 
                              placeholder="سبب الإلغاء..." 
                              value={selectedPatient.cancelReason || ''}
                              onChange={(e) => {
                                const updated = { ...selectedPatient, cancelReason: e.target.value };
                                setSelectedPatient(updated);
                                setPatients(prev => prev.map(p => p.id === updated.id ? updated : p));
                              }}
                              className="w-full bg-transparent border-none outline-none text-xs text-gray-800 dark:text-gray-100 placeholder-red-300 dark:placeholder-red-500/70"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* قسم المبالغ + زر العمليات المالية الجديد */}
                <div className="mb-4 relative">
                  <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">التقرير المالي للمريض</span>
                    <button 
                      onClick={() => setShowFinancialMenu(!showFinancialMenu)}
                      className="p-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
                    >
                      <MoreHorizontal size={16} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    
                    {/* القائمة المنسدلة للعمليات المالية */}
                    {showFinancialMenu && (
                      <>
                        <div className="fixed inset-0 z-[105]" onClick={() => setShowFinancialMenu(false)}></div>
                        <div className="absolute left-0 top-8 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 z-[110] flex flex-col gap-0.5 animate-fade-in">
                          <button onClick={() => {setFinancialAction('lab'); setShowFinancialMenu(false);}} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700"><FlaskConical size={14} className="text-red-500" /> إضافة حساب معمل</button>
                          <button onClick={() => {setFinancialAction('payment'); setShowFinancialMenu(false);}} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700"><Wallet size={14} className="text-blue-500" /> تسجيل دفعة</button>
                          <button onClick={() => {setFinancialAction('discount'); setShowFinancialMenu(false);}} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700"><Gift size={14} className="text-emerald-500" /> عمل خصم للمريض</button>
                          <button onClick={() => {setFinancialAction('fee'); setShowFinancialMenu(false);}} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700"><Receipt size={14} className="text-amber-500" /> رسوم إضافية</button>
                          <button onClick={() => {setFinancialAction('refund'); setShowFinancialMenu(false);}} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700"><Undo size={14} className="text-indigo-500" /> استرداد مالي (إرجاع)</button>
                          <div className="h-px bg-gray-100 dark:bg-gray-700 my-0.5"></div>
                          <button onClick={() => {
                            setEditCostAmount(selectedPatient.cost.toString());
                            setEditPaidAmount(selectedPatient.paid.toString());
                            setShowEditAmountsModal(true); 
                            setShowFinancialMenu(false);
                          }} className="text-xs px-2 py-2 rounded-lg text-right flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:bg-gray-700"><Edit2 size={14} className="text-gray-500" /> تعديل المبالغ</button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2 w-full">
                    <div onClick={() => setShowCostDetailsModal(true)} className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-700 p-2 rounded-xl text-center border border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex flex-col justify-center">
                      <p className={`font-bold mb-1 truncate flex justify-center items-center gap-1 ${getPatientLabCost(selectedPatient) > 0 ? 'text-[10px]' : 'text-xs'} text-gray-500`}><Info size={10} className="inline opacity-70" /> إجمالي التكلفة</p>
                      <input type="text" value={formatCurrency(selectedPatient.cost)} readOnly className={`w-full text-center font-bold text-gray-800 dark:text-gray-100 bg-transparent outline-none truncate cursor-pointer pointer-events-none ${getPatientLabCost(selectedPatient) > 0 ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`} />
                    </div>
                    <div onClick={() => setShowPatientPaidModal(true)} className="flex-1 min-w-0 bg-[#f8f7ff] dark:bg-indigo-900/20 p-2 rounded-xl text-center border border-indigo-50 dark:border-indigo-900/50 flex flex-col justify-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                      <p className={`font-bold mb-1 truncate flex justify-center items-center gap-1 ${getPatientLabCost(selectedPatient) > 0 ? 'text-[10px]' : 'text-xs'} text-[#5a55d2]`}><Info size={10} className="inline opacity-70" /> {getPatientLabCost(selectedPatient) > 0 ? 'المدفوعات' : 'إجمالي المدفوعات'}</p>
                      <input type="text" value={formatCurrency(selectedPatient.paid)} readOnly className={`w-full text-center font-black text-[#5a55d2] bg-transparent outline-none truncate cursor-pointer pointer-events-none ${getPatientLabCost(selectedPatient) > 0 ? 'text-sm md:text-base' : 'text-lg md:text-xl'}`} />
                    </div>
                    <div className={`flex-1 min-w-0 p-2 rounded-xl text-center border flex flex-col justify-center ${selectedPatient.remaining > 0 ? 'bg-[#fffcf5] dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50' : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-700'}`}>
                      <p className={`font-bold mb-1 truncate flex justify-center items-center gap-1 ${getPatientLabCost(selectedPatient) > 0 ? 'text-[10px]' : 'text-xs'} ${selectedPatient.remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>المتبقي</p>
                      <input type="text" value={formatCurrency(selectedPatient.remaining)} readOnly className={`w-full text-center font-black bg-transparent outline-none truncate pointer-events-none ${getPatientLabCost(selectedPatient) > 0 ? 'text-sm md:text-base' : 'text-lg md:text-xl'} ${selectedPatient.remaining > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`} />
                    </div>
                    {getPatientLabCost(selectedPatient) > 0 && (
                      <div className="flex-1 min-w-0 bg-red-50 dark:bg-red-900/20 p-2 rounded-xl text-center border border-red-100 dark:border-red-900/50 flex flex-col justify-center">
                        <p className="text-[10px] text-red-600 dark:text-red-400 font-bold mb-1 truncate flex justify-center items-center gap-1">حساب المعامل</p>
                        <input type="text" value={formatCurrency(getPatientLabCost(selectedPatient))} readOnly className="w-full text-center text-sm md:text-base font-bold text-red-600 dark:text-red-400 bg-transparent outline-none truncate pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl mb-4 border border-indigo-100 dark:border-indigo-800">
                  <h3 className="text-xs font-bold text-[#5a55d2] mb-2 flex items-center gap-1"><Calendar size={14} /> موعد الجلسة القادمة</h3>
                  <div className="flex gap-2">
                    <input type="text" placeholder="التاريخ (مثلاً: 15 مايو)" value={selectedPatient.nextAppointmentDate} onChange={(e) => updatePatient({...selectedPatient, nextAppointmentDate: e.target.value})} className="flex-1 text-xs border-0 rounded-lg p-2 focus:ring-1 focus:ring-indigo-300 bg-white dark:bg-gray-800 dark:text-white" />
                    <input type="text" placeholder="الساعة" value={selectedPatient.nextAppointmentTime} onChange={(e) => updatePatient({...selectedPatient, nextAppointmentTime: e.target.value})} className="w-20 text-xs border-0 rounded-lg p-2 focus:ring-1 focus:ring-indigo-300 text-center bg-white dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                {/* نموذج إدخال العملية المالية (يظهر عند اختيار عنصر من القائمة السابقة) */}
                {financialAction && (
                  <div id="financial-edit-box" className={`border p-3 rounded-2xl mb-4 transition-all duration-300 animate-fade-in flex flex-col gap-2 ${editingVisitId && financialAction ? 'bg-indigo-50/80 dark:bg-indigo-900/40 border-[#5a55d2] ring-2 ring-[#5a55d2]/30 shadow-md transform scale-[1.01]' : 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800'}`}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-300">
                        {financialAction === 'lab' && <><FlaskConical size={14} className="text-red-500"/> حساب معمل</>}
                        {financialAction === 'payment' && <><Wallet size={14} className="text-blue-500"/> تسجيل دفعة</>}
                        {financialAction === 'discount' && <><Gift size={14} className="text-emerald-500"/> عمل خصم</>}
                        {financialAction === 'fee' && <><Receipt size={14} className="text-amber-500"/> رسوم إضافية</>}
                        {financialAction === 'refund' && <><Undo size={14} className="text-indigo-500"/> استرداد مالي</>}
                      </h3>
                      <button onClick={() => {
                        if (editingVisitId && financialAction) {
                          setEditingVisitId(null);
                        }
                        setFinancialAction(null); 
                        setFinAmount(''); 
                        setFinNote('');
                        setFinLabWorkType('');
                      }} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"><X size={14} /></button>
                    </div>
                    <div className="flex gap-2">
                      {financialAction === 'lab' ? (
                        <>
                          <input type="text" placeholder="نوع العمل..." value={finLabWorkType} onChange={(e) => setFinLabWorkType(e.target.value)} className="flex-1 min-w-0 text-xs border border-indigo-200 dark:border-indigo-700 rounded-xl p-2 focus:border-[#5a55d2] outline-none bg-white dark:bg-gray-800" />
                          <input type="text" placeholder="اسم المعمل..." value={finNote} onChange={(e) => setFinNote(e.target.value)} className="flex-1 min-w-0 text-xs border border-indigo-200 dark:border-indigo-700 rounded-xl p-2 focus:border-[#5a55d2] outline-none bg-white dark:bg-gray-800" />
                        </>
                      ) : (
                        <input type="text" placeholder="ملاحظة (اختياري)..." value={finNote} onChange={(e) => setFinNote(e.target.value)} className="flex-1 text-xs border border-indigo-200 dark:border-indigo-700 rounded-xl p-2 focus:border-[#5a55d2] outline-none bg-white dark:bg-gray-800" />
                      )}
                      <input type="text" inputMode="decimal" placeholder="المبلغ..." value={finAmount} onChange={(e) => setFinAmount(parseAmount(e.target.value))} className="w-20 text-xs border border-indigo-200 dark:border-indigo-700 rounded-xl p-2 focus:border-[#5a55d2] outline-none text-center bg-white dark:bg-gray-800 shrink-0" />
                      <button onClick={executeFinancialAction} className="bg-[#5a55d2] text-white px-3 rounded-xl hover:bg-indigo-700 transition-colors shrink-0"><Check size={16} /></button>
                    </div>
                  </div>
                )}

                {/* نموذج الجلسة العادية */}
                <div id="session-edit-box" className={`bg-white dark:bg-gray-800 border p-3 rounded-2xl mb-4 transition-all duration-300 ${editingVisitId && !financialAction ? 'border-emerald-400 ring-2 ring-emerald-400/50 dark:border-emerald-500 shadow-md transform scale-[1.01]' : 'border-dashed border-gray-200 dark:border-gray-600'}`}>
                  <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        {editingVisitId && !financialAction ? <Edit2 size={14} className="text-[#10b981] dark:text-emerald-400" /> : <Plus size={14} />} 
                        {editingVisitId && !financialAction ? 'تعديل بيانات الجلسة' : 'تسجيل إجراء / دفعة جديدة'}
                      </h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      
                      <div className="flex gap-2">
                        <input id="session-procedure-input" type="text" placeholder="نوع الإجراء (مثلاً: حشو عصب)" value={sessionProcedure} onChange={(e) => setSessionProcedure(e.target.value)} className="flex-1 text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2.5 focus:border-[#5a55d2] outline-none" />
                        <button onClick={() => setShowSessionDetails(!showSessionDetails)} className={`w-10 flex justify-center items-center rounded-xl border transition-colors ${showSessionDetails ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'}`}>
                          <FileText size={14} />
                        </button>
                      </div>

                      {showSessionDetails && (
                        <textarea placeholder="تفاصيل دقيقة للإجراء (اختياري)..." value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} rows={1} className="w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 focus:border-[#5a55d2] outline-none resize-none animate-fade-in" />
                      )}

                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <span className="absolute -top-2 right-2 bg-white dark:bg-gray-800 px-1 text-[8px] text-gray-400 dark:text-gray-500">تكلفة الإجراء</span>
                          <input type="text" inputMode="decimal" placeholder="0" value={sessionCost} onChange={(e) => setSessionCost(parseAmount(e.target.value))} className="w-full text-xs border border-gray-200 dark:border-gray-600 bg-transparent dark:text-white rounded-xl p-2 focus:border-[#5a55d2] outline-none text-center" />
                        </div>
                        
                        <div className="flex-1 relative">
                          <span className="absolute -top-2 right-2 bg-white dark:bg-gray-800 px-1 text-[8px] text-[#5a55d2] dark:text-indigo-400">المدفوع الان</span>
                          <input type="text" inputMode="decimal" placeholder="0" value={sessionPaid} onChange={(e) => setSessionPaid(parseAmount(e.target.value))} className="w-full text-xs border border-[#5a55d2] dark:border-indigo-500 rounded-xl p-2 focus:border-[#5a55d2] outline-none text-center font-bold text-[#5a55d2] dark:text-indigo-400 bg-[#f8f7ff] dark:bg-indigo-900/20" />
                        </div>

                        {editingVisitId && !financialAction ? (
                          <div className="flex gap-1 items-center">
                            <button onClick={handleAddSession} className="bg-[#10b981] text-white h-full px-3 rounded-xl hover:bg-emerald-600 transition-colors flex justify-center items-center"><Check size={16} /></button>
                            <button onClick={() => {setEditingVisitId(null); setSessionProcedure(''); setSessionCost(''); setSessionPaid(''); setSessionNotes(''); setShowSessionDetails(false);}} className="bg-red-50 dark:bg-red-900/30 text-red-500 h-full px-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex justify-center items-center"><X size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={handleAddSession} className="bg-[#10b981] text-white px-4 rounded-xl hover:bg-emerald-600 transition-colors flex justify-center items-center"><Plus size={18} /></button>
                        )}
                      </div>
                    </div>
                  </div>

                {/* قسم السجلات المطوي (Accordion) */}
                <div onClick={() => setIsHistoryExpanded(!isHistoryExpanded)} className="flex items-center justify-between mb-2 px-1 cursor-pointer bg-gray-50 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 dark:bg-gray-700 transition-colors border border-gray-100 dark:border-gray-700">
                  <h3 className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <History size={14} className="text-[#5a55d2]" /> سجل الجلسات والمدفوعات ({selectedPatient.visits.length})
                  </h3>
                  {isHistoryExpanded ? <ChevronUp size={16} className="text-gray-400 dark:text-gray-500" /> : <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />}
                </div>

                {isHistoryExpanded && (
                  <div className="space-y-2 animate-fade-in mb-4">
                    {(() => {
                      // حساب الرصيد التراكمي لعرضه في الشريط المصغر
                      let runningCost = parseFloat(selectedPatient.cost as any) || 0;
                      let runningPaid = parseFloat(selectedPatient.paid as any) || 0;

                      const visitsWithSnapshots = [...selectedPatient.visits].map((v) => {
                        const currentSnapshot = {
                          cost: runningCost,
                          paid: runningPaid,
                          remaining: runningCost - runningPaid
                        };
                        // خصم مساهمة هذه العملية للحصول على الأرصدة التي كانت قبلها
                        runningCost -= (parseFloat(v.cost as any) || 0);
                        runningPaid -= (parseFloat(v.paid as any) || 0);
                        return { ...v, snapshot: currentSnapshot };
                      });

                      return visitsWithSnapshots.map((v) => (
                        <div key={v.id} className={`flex flex-col p-3 rounded-xl border shadow-sm ${v.isFinancial ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-100 dark:border-indigo-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                          
                          {/* السطر الأول: التاريخ وأزرار التحكم */}
                          <div className="flex justify-between items-center mb-2 border-b border-gray-50 dark:border-gray-700 pb-2">
                            <span className="text-[10px] text-[#5a55d2] dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md flex items-center gap-1"><Calendar size={10} /> {v.date}</span>
                            <div className="flex gap-1.5">
                              {!v.isFinancial && v.cost > 0 && (
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSplitVisitId(v.id);
                                  setTempVisitSplits(v.splits || []);
                                  setShowVisitSplitModal(true);
                                }} className="p-1.5 bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/50 transition-colors" title="تجزئة الإجراء">
                                  <PieChart size={12}/>
                                </button>
                              )}
                              <button onClick={() => handleEditSession(v)} className="p-1.5 bg-gray-50 dark:bg-gray-700 text-indigo-500 dark:text-indigo-400 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" title="تعديل">
                                <Edit2 size={12}/>
                              </button>
                              <button onClick={() => handleDeleteSession(v.id, v.isFinancial)} className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title={v.isFinancial ? 'تراجع' : 'حذف'}>
                                {v.isFinancial ? <Undo size={12}/> : <Trash2 size={12}/>}
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-start w-full cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 rounded-md transition-colors p-1 -m-1" onClick={() => {
                            if (!v.isFinancial && v.cost > 0) {
                              setActiveSplitVisitId(v.id);
                              setTempVisitSplits(v.splits || []);
                              setShowVisitSplitModal(true);
                            }
                          }}>
                            <div className="flex-1 pr-1">
                              <p className={`text-xs font-bold leading-tight mb-1 flex items-center gap-1 ${v.type === 'discount' ? 'text-emerald-600 dark:text-emerald-400' : v.type === 'refund' ? 'text-indigo-500 dark:text-indigo-400' : v.type === 'fee' ? 'text-amber-600 dark:text-amber-400' : v.type === 'lab' ? 'text-red-500 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                                {v.type === 'discount' && <Gift size={12}/>}
                                {v.type === 'fee' && <Receipt size={12}/>}
                                {v.type === 'refund' && <Undo size={12}/>}
                                {v.type === 'lab' && <FlaskConical size={12}/>}
                                {v.procedure}
                              </p>
                              {v.notes && <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 leading-tight">{v.notes}</p>}
                            </div>
                            <div className="text-left flex flex-col items-end justify-center min-w-[70px] pl-1 gap-0.5">
                              {v.cost > 0 && <span className={`${v.type === 'fee' ? 'text-xs font-bold text-amber-600 dark:text-amber-400' : 'text-[10px] font-bold text-gray-500 dark:text-gray-400'}`}>التكلفة: {v.type === 'fee' ? '+' : ''}{formatCurrency(v.cost)}</span>}
                              {v.cost < 0 && <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400">الخصم: {formatCurrency(Math.abs(v.cost))}</span>}
                              
                              {v.paid > 0 && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">المدفوع: +{formatCurrency(v.paid)}</span>}
                              {v.paid < 0 && <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">مسترد: {formatCurrency(Math.abs(v.paid))}</span>}
                              
                              {v.labCost > 0 && <span className="text-xs font-bold text-red-500 dark:text-red-400">معمل: {formatCurrency(v.labCost)}</span>}
                              {(!v.cost && !v.paid && !v.labCost) && <span className="text-[10px] text-gray-400 dark:text-gray-500">بدون مبالغ</span>}
                            </div>
                          </div>

                          {/* عرض التجزئة المصغرة في السجل */}
                          {v.splits && v.splits.length > 0 && (
                            <div className="mt-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-2 border border-indigo-100/50 dark:border-indigo-800/50">
                              <p className="text-[9px] text-[#5a55d2] font-bold mb-1 opacity-70">تفاصيل الإجراءات (التجزئة):</p>
                              <div className="space-y-1">
                                {v.splits.map(split => (
                                  <div key={split.id} className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-600 dark:text-gray-300 font-medium before:content-['•'] before:mr-0.5 before:ml-1 before:text-indigo-300">- {split.name}</span>
                                    <span className="text-gray-500 font-bold">{formatCurrency(split.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* شريط حالة الحساب المصغر بعد العملية */}
                          <div className="mt-2 bg-gray-50 dark:bg-gray-700 rounded-md p-2 flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <span className="font-bold text-gray-600 dark:text-gray-300">الرصيد بعدها:</span>
                            <span>التكلفة: <span className="font-bold text-gray-700 dark:text-gray-200">{formatCurrency(v.snapshot.cost)}</span></span>
                            <span className="text-[#5a55d2] dark:text-indigo-400">المدفوع: <span className="font-bold">{formatCurrency(v.snapshot.paid)}</span></span>
                            <span className="text-amber-600 dark:text-amber-400">المتبقي: <span className="font-bold">{formatCurrency(v.snapshot.remaining)}</span></span>
                          </div>
                        </div>
                      ));
                    })()}
                    {selectedPatient.visits.length === 0 && (
                      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 py-2">لا توجد سجلات</p>
                    )}
                  </div>
                )}

                <textarea rows={2} placeholder="ملاحظات عامة لملف المريض..." value={selectedPatient.notes} onChange={(e) => updatePatient({...selectedPatient, notes: e.target.value})} className="w-full border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-xs mt-2 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:border-[#5a55d2] resize-none" />
                
                <button onClick={() => handleDeletePatient(selectedPatient.id)} className="w-full mt-6 text-red-400 hover:text-red-600 dark:text-red-400 text-xs font-bold py-2 border border-dashed border-red-100 rounded-xl">حذف ملف المريض بالكامل</button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تعديل المبالغ */}
        {showEditAmountsModal && selectedPatient && (
          <div className="absolute inset-0 z-[120] bg-black/50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setShowEditAmountsModal(false)}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl flex flex-col p-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Edit2 size={16} className="text-[#5a55d2]" /> تعديل المبالغ يدوياً
              </h3>
              <div className="flex flex-col gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">إجمالي التكلفة</label>
                  <input type="text" inputMode="decimal" value={editCostAmount} onChange={e => setEditCostAmount(parseAmount(e.target.value))} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:border-[#5a55d2]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">إجمالي المدفوعات</label>
                  <input type="text" inputMode="decimal" value={editPaidAmount} onChange={e => setEditPaidAmount(parseAmount(e.target.value))} className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:border-[#5a55d2]" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  const newCost = parseFloat(editCostAmount) || 0;
                  const newPaid = parseFloat(editPaidAmount) || 0;
                  updatePatient({
                    ...selectedPatient,
                    cost: newCost,
                    paid: newPaid,
                    remaining: newCost - newPaid
                  });
                  setShowEditAmountsModal(false);
                }} className="flex-1 bg-[#5a55d2] text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">حفظ التعديلات</button>
                <button onClick={() => setShowEditAmountsModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {/* نافذة تفاصيل المدفوعات */}
        {showPatientPaidModal && selectedPatient && (
          <div className="absolute inset-0 z-[120] bg-black/50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setShowPatientPaidModal(false)}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-bold text-[#5a55d2] dark:text-indigo-400 flex items-center gap-2">
                  <Wallet size={16} /> سجل مدفوعات المريض
                </h3>
                <button onClick={() => setShowPatientPaidModal(false)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={14} className="text-gray-600 dark:text-gray-300" /></button>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {selectedPatient.visits.filter(v => typeof v.paid === 'number' && v.paid > 0).map(visit => (
                    <div key={visit.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-sm flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded"><Calendar size={10} /> {visit.date}</span>
                        <span className="text-sm font-bold text-[#5a55d2] dark:text-indigo-400">{formatCurrency(visit.paid)}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{visit.procedure || 'دفعة غير محددة'}</p>
                      {visit.notes && <p className="text-[10px] text-gray-500 dark:text-gray-400">{visit.notes}</p>}
                    </div>
                  ))}
                  {selectedPatient.visits.filter(v => typeof v.paid === 'number' && v.paid > 0).length === 0 && (
                    <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                      لا توجد أي مدفوعات مسجلة لهذا المريض
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
                 <div className="flex justify-between items-center bg-[#f8f7ff] dark:bg-indigo-900/20 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                   <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">إجمالي المدفوعات:</span>
                   <span className="text-lg font-black text-[#5a55d2] dark:text-indigo-400">{formatCurrency(selectedPatient.paid)}</span>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة سجل وتفاصيل التكاليف */}
        {showCostDetailsModal && selectedPatient && (
          <div className="absolute inset-0 z-[120] bg-black/50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setShowCostDetailsModal(false)}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <PieChart size={16} className="text-[#5a55d2]" /> سجل وتفاصيل التكاليف
                </h3>
                <button onClick={() => setShowCostDetailsModal(false)} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={14} className="text-gray-600 dark:text-gray-300" /></button>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-2.5 rounded-lg mb-4">
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed text-center">💡 تلميح: يمكنك تجزئة التكلفة الكلية لأي جلسة علاجية إلى إجراءات فرعية متعددة لتوضيح تفاصيل التكلفة.</p>
                </div>

                <div className="space-y-3">
                  {selectedPatient.visits.filter(v => typeof v.cost === 'number' && v.cost > 0).map(visit => {
                    const hasSplits = visit.splits && visit.splits.length > 0;
                    const isExpanded = expandedVisits.includes(visit.id);
                    return (
                      <div key={visit.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-3 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">{visit.date}</span>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">{visit.procedure || 'إجراء غير مسمى'}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-sm font-black text-[#5a55d2] dark:text-indigo-400">{formatCurrency(visit.cost)}</span>
                            <button onClick={() => {
                              setActiveSplitVisitId(visit.id);
                              setTempVisitSplits(visit.splits || []);
                              setShowVisitSplitModal(true);
                            }} className="text-[9px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-2 py-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 shadow-sm">
                              <Edit2 size={10} /> {hasSplits ? 'تعديل التجزئة' : 'تجزئة المبلغ ✂️'}
                            </button>
                          </div>
                        </div>
                        {hasSplits && (
                          <div className="border-t border-gray-100 dark:border-gray-700">
                            <button onClick={() => toggleVisitExpansion(visit.id)} className="w-full py-1.5 bg-indigo-50/50 dark:bg-indigo-900/10 text-[10px] text-[#5a55d2] dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex justify-center items-center gap-1 font-bold">
                              تفاصيل الإجراءات الفرعية {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            {isExpanded && (
                              <div className="p-2 bg-white dark:bg-gray-800 space-y-1">
                                {visit.splits!.map(split => (
                                  <div key={split.id} className="flex justify-between items-center text-[11px] py-1 px-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                                    <span className="text-gray-600 dark:text-gray-300 font-bold">{split.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{formatCurrency(split.amount)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {selectedPatient.visits.filter(v => typeof v.cost === 'number' && v.cost > 0).length === 0 && (
                    <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">لا توجد سجلات ذات تكلفة مسجلة لهذا المريض</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* نافذة التجزئة لسجل معين (Sub-modal) */}
        {showVisitSplitModal && selectedPatient && activeSplitVisitId && (() => {
          const visit = selectedPatient.visits.find(v => v.id === activeSplitVisitId);
          if (!visit) return null;
          
          const visitCost = Number(visit.cost);
          const totalSplitsCost = tempVisitSplits.reduce((sum, s) => sum + Number(s.amount), 0);
          const isMatch = totalSplitsCost === visitCost;

          const handleSaveVisitSplits = () => {
            if (isMatch) {
              const updatedVisits = selectedPatient.visits.map(v => 
                v.id === activeSplitVisitId ? { ...v, splits: tempVisitSplits } : v
              );
              updatePatient({ ...selectedPatient, visits: updatedVisits });
              setShowVisitSplitModal(false);
            } else {
              showConfirm(`مجموع أرقام التجزئة (${formatCurrency(totalSplitsCost)}) يختلف عن التكلفة المسجلة للجلسة (${formatCurrency(visitCost)}). هل أنت متأكد من رغبتك في اعتماد المجموع الجديد وتغيير التكلفة الكلية للمريض لتتوافق مع هذا التعديل؟`, () => {
                const costDifference = totalSplitsCost - visitCost;
                const updatedVisits = selectedPatient.visits.map(v => 
                  v.id === activeSplitVisitId ? { ...v, splits: tempVisitSplits, cost: totalSplitsCost } : v
                );
                const newTotalCost = Number(selectedPatient.cost) + costDifference;
                updatePatient({
                  ...selectedPatient,
                  cost: newTotalCost,
                  remaining: newTotalCost - Number(selectedPatient.paid),
                  visits: updatedVisits
                });
                setShowVisitSplitModal(false);
              });
            }
          };

          return (
            <div className="absolute inset-0 z-[130] bg-black/60 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setShowVisitSplitModal(false)}>
              <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-2xl">
                  <h3 className="text-xs font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5 truncate pr-2">
                    <PieChart size={14} className="text-[#5a55d2] shrink-0" /> تجزئة: {visit.procedure || 'إجراء غير مسمى'}
                  </h3>
                  <button onClick={() => setShowVisitSplitModal(false)} className="p-1.5 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"><X size={14} className="text-gray-600 dark:text-gray-300" /></button>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                  <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-4">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">إجمالي التكلفة المسجلة:</span>
                    <span className="text-sm font-black text-indigo-700 dark:text-indigo-400">{formatCurrency(visitCost)}</span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {tempVisitSplits.map(split => (
                      <div key={split.id} className={`flex justify-between items-center p-2 rounded-lg border shadow-sm transition-all ${editingSplitId === split.id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}>
                        {editingSplitId === split.id ? (
                          <div className="flex gap-2 w-full animate-fade-in">
                            <input type="text" value={editingSplitName} onChange={e => setEditingSplitName(e.target.value)} className="flex-1 text-xs border border-blue-200 dark:border-blue-700 rounded-lg p-1.5 bg-white dark:bg-gray-800 outline-none focus:border-[#5a55d2]" />
                            <input type="number" value={editingSplitAmount} onChange={e => setEditingSplitAmount(e.target.value)} className="w-20 text-xs border border-blue-200 dark:border-blue-700 rounded-lg p-1.5 bg-white dark:bg-gray-800 outline-none focus:border-[#5a55d2] text-center" />
                            <button onClick={() => {
                              if (editingSplitName && editingSplitAmount) {
                                const amt = parseFloat(editingSplitAmount);
                                if (amt > 0) {
                                  setTempVisitSplits(tempVisitSplits.map(s => s.id === editingSplitId ? { ...s, name: editingSplitName, amount: amt } : s));
                                  setEditingSplitId(null);
                                }
                              }
                            }} className="bg-[#10b981] text-white p-1.5 rounded-lg hover:bg-emerald-600 transition-colors h-[28px] w-[28px] flex justify-center items-center shrink-0 shadow-sm"><Check size={14} /></button>
                            <button onClick={() => setEditingSplitId(null)} className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 p-1.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors h-[28px] w-[28px] flex justify-center items-center shrink-0 shadow-sm"><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{split.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{formatCurrency(split.amount)}</span>
                              <div className="flex gap-1 border-r border-gray-100 dark:border-gray-700 pr-2 ml-1">
                                <button onClick={() => {
                                  setEditingSplitId(split.id);
                                  setEditingSplitName(split.name);
                                  setEditingSplitAmount(split.amount.toString());
                                }} className="p-1 text-[#5a55d2] hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors" title="تعديل"><Edit2 size={12} /></button>
                                <button onClick={() => {
                                  setTempVisitSplits(tempVisitSplits.filter(s => s.id !== split.id));
                                }} className="p-1 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="حذف"><Trash2 size={12} /></button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {tempVisitSplits.length === 0 && (
                      <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">القائمة فارغة، أضف إجراءات فرعية أسفله</div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800 mb-4">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">إجمالي تكلفة الإجراءات:</span>
                    <span className={`text-sm font-black ${isMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      {formatCurrency(totalSplitsCost)}
                    </span>
                  </div>

                  <div className="flex gap-2 items-end bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex-1">
                      <label className="text-[10px] text-blue-600 dark:text-blue-400 mb-1 block">اسم الإجراء</label>
                      <input type="text" value={splitName} onChange={e => setSplitName(e.target.value)} className="w-full text-xs border border-blue-200 dark:border-blue-700 rounded-lg p-2 bg-white dark:bg-gray-800 outline-none focus:border-[#5a55d2]" />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] text-blue-600 dark:text-blue-400 mb-1 block">المبلغ</label>
                      <input type="text" inputMode="decimal" value={splitAmount} onChange={e => setSplitAmount(parseAmount(e.target.value))} className="w-full text-xs border border-blue-200 dark:border-blue-700 rounded-lg p-2 bg-white dark:bg-gray-800 outline-none focus:border-[#5a55d2] text-center" />
                    </div>
                    <button onClick={() => {
                      if (!splitName || !splitAmount) return;
                      const amt = parseFloat(splitAmount);
                      if (amt <= 0) return;
                      setTempVisitSplits([...tempVisitSplits, { id: generateId(), name: splitName, amount: amt }]);
                      setSplitName('');
                      setSplitAmount('');
                    }} className="bg-[#5a55d2] text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors h-[34px] w-[34px] flex justify-center items-center shrink-0 shadow-sm"><Plus size={16} /></button>
                  </div>
                  
                  <div className="mt-6 flex gap-2">
                    <button onClick={handleSaveVisitSplits} className="flex-1 bg-[#5a55d2] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 shadow-sm">
                      <Check size={16} /> حفظ التجزئة واعتمادها
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* نافذة التقارير المجمعة */}
        {reportModalType !== 'none' && (
          <div className="absolute inset-0 z-[110] bg-black/50 flex justify-center items-center backdrop-blur-sm p-4" onClick={() => setReportModalType('none')}>
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${reportModalType === 'debts' ? 'text-amber-600 dark:text-amber-400' : reportModalType === 'paid' ? 'text-[#5a55d2] dark:text-indigo-400' : reportModalType === 'lab' ? 'text-red-500 dark:text-red-400' : reportModalType === 'withdrawals' ? 'text-teal-600 dark:text-teal-400' : reportModalType === 'expenses' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-800 dark:text-gray-100'}`}>
                  <Info size={20} /> 
                  {reportModalType === 'debts' ? 'كشف الديون (المتبقي)' : 
                   reportModalType === 'paid' ? 'كشف المبالغ المدفوعة' : 
                   reportModalType === 'cost' ? 'كشف إجمالي التكاليف' : 
                   reportModalType === 'withdrawals' ? 'كشف السحبيات' :
                   reportModalType === 'expenses' ? 'كشف الصرفيات' :
                   'كشف حسابات المعمل'}
                </h2>
                <button onClick={() => setReportModalType('none')} className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><X size={18} className="text-gray-600 dark:text-gray-300" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {reportData.map((p: any) => (
                  <div key={p.id} onClick={() => { if (!p.isNonPatient) { handleSelectPatient(p); setReportModalType('none'); } }} className={`flex justify-between items-center border-b border-gray-50 dark:border-gray-700 py-3 ${!p.isNonPatient ? 'cursor-pointer hover:bg-gray-50 dark:bg-gray-700' : ''} px-2 rounded-lg transition-colors`}>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{p.name}</span>
                      {p.isNonPatient && <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{p.date} - {p.time}</span>}
                    </div>
                    <span className={`font-black px-3 py-1 rounded-lg text-sm ${reportModalType === 'debts' ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' : reportModalType === 'paid' ? 'text-[#5a55d2] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : reportModalType === 'lab' ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : reportModalType === 'withdrawals' ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20' : reportModalType === 'expenses' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700'}`}>
                      {p.val}
                    </span>
                  </div>
                ))}
                {reportData.length === 0 && (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">لا توجد بيانات مرتبطة بهذا القسم</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* نظام التنبيهات المخصص (Custom Dialogs) */}
        {dialog.visible && (
          <div className="absolute inset-0 z-[200] bg-black/50 flex justify-center items-center backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-5 flex flex-col gap-4 animate-fade-in">
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                {dialog.type === 'confirm' ? <Info className="text-amber-500" size={20}/> : <Info className="text-indigo-500" size={20}/>}
                {dialog.type === 'confirm' ? 'تأكيد الإجراء' : 'تنبيه'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{dialog.message}</p>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setDialog({ ...dialog, visible: false, message: '', type: 'alert', onConfirm: null })} className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-600 transition-colors">
                  {dialog.type === 'confirm' ? 'إلغاء' : 'حسناً فهمت'}
                </button>
                {dialog.type === 'confirm' && dialog.onConfirm && (
                  <button onClick={() => { 
                    const cb = dialog.onConfirm;
                    setDialog({ visible: false, message: '', type: 'alert', onConfirm: null }); 
                    if(cb) setTimeout(cb, 0);
                  }} className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">
                    نعم، تأكيد
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

