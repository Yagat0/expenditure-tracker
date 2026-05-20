import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit3, X, Upload } from 'lucide-react';

import dayjs, { type Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/cs';
import 'dayjs/locale/en';

import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, 
  useMediaQuery, useTheme, TextField, FormControl, InputLabel, Select, MenuItem, 
  Stack, InputAdornment, IconButton, FormHelperText, CircularProgress,
  Snackbar, Alert,
  type AlertColor
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useSettings } from '../context/SettingsContext';
import { useExpenses } from '../context/ExpenseContext';
import { useI18n } from '../i18n/useI18n';

import type { Expense } from '../types/expense';
import type { RecurrenceType } from '../types/common';

import { GoogleGenerativeAI } from "@google/generative-ai";

interface AddExpenseWizardProps {
  open: boolean;
  onClose: () => void;
  expenseToEdit?: Expense;
}

const analyzeReceiptWithAI = async (base64Image: string, availableCategories: string[]): Promise<Partial<Expense>> => {
  try {
    // Nutné bezpečnostní zlo pro semestrálku
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error('MISSING_API_KEY');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    // NOTE: Jestliže již 2.5-flash nebude dostupný, nutno přepsat
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Jsi pokročilý analyzátor účtenek. Podívej se na přiloženou fotografii účtenky a extrahuj z ní údaje.
      Vrať výsledek STRIKTNĚ A POUZE jako JSON objekt s těmito klíči:
      - "amount": (číslo) celková konečná částka k úhradě.
      - "location": (řetězec) název obchodu, restaurace nebo podniku.
      - "date": (řetězec) datum nákupu ve formátu ISO "YYYY-MM-DDTHH:mm". Pokud chybí čas, dej "12:00". Pokud nejde datum přečíst, vrať null.
      - "category": (řetězec) vyber logicky právě jednu kategorii z tohoto seznamu: [${availableCategories.join(', ')}]. Pokud si nejsi jistý, dej první v seznamu..
      
      Nevracej absolutně žádný jiný text, markdown, ani vysvětlování. Jen čistý JSON.
    `;

    // Rozdělení Base64 stringu (Google API nepřijímá data:image/jpeg;base64,)
    const mimeType = base64Image.split(';')[0].split(':')[1];
    const imagePart = {
      inlineData: { data: base64Image.split(',')[1], mimeType }
    };

    const result = await model.generateContent([prompt, imagePart]); // Děj se vůle Boží
    const responseText = result.response.text();
    
    // Očištění od případného markdown formátování
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
  
    return JSON.parse(cleanJsonString);

  } catch (error) {
    console.error('AI_ANALYSIS_FAILED', error);
    throw error;
  }
};

export const AddExpenseWizard: React.FC<AddExpenseWizardProps> = ({ open, onClose, expenseToEdit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { categories, defaultCurrency } = useSettings();
  const { addExpense, updateExpense } = useExpenses();
  const { t, muiLocaleText, datePickerAdapterLocale } = useI18n();

  const [step, setStep] = useState(0); // 0 - Výběr; 1 - Fotka; 2 - Formulář
  const [cameFromScanner, setCameFromScanner] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stav formuláře
  const [amount, setAmount] = useState<string>(''); // string kvůli plné kontrole nad textfieldem
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [stopDate, setStopDate] = useState('');

  // Stavy pro validaci a zobrazení chyb
  const [showErrors, setShowErrors] = useState(false); // Stav pro zvýraznění povinných polí
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({
    open: false, message: '', severity: 'info'
  });

  const showSnackbar = (message: string, severity: AlertColor = 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const isStopDateBeforeExpenseDate = (stopDateValue: string, expenseDateValue: string) => {
    if (!stopDateValue || !expenseDateValue) return false; // Jedno není nastaveno

    const stop = dayjs(stopDateValue);
    const expense = dayjs(expenseDateValue);
    if (!stop.isValid() || !expense.isValid()) return false;

    return stop.isBefore(expense, 'day');
  };

  const clearInvalidStopDate = () => {
    setStopDate('');
    showSnackbar(t('wizard.generateUntilInvalidAlert'), 'warning');
  };

  // Dialog v paměti dál existuje, i když je neviditelný
  useEffect(() => {
    if (open) {
      setShowErrors(false);
      setSnackbar({ open: false, message: '', severity: 'warning' });

      if (expenseToEdit) {
        setAmount(expenseToEdit.amount.toString());
        setDate(new Date(expenseToEdit.date).toISOString().slice(0, 16));
        setCategory(expenseToEdit.category);
        setLocation(expenseToEdit.location || '');
        setNote(expenseToEdit.note || '');
        setRecurrence(expenseToEdit.recurrence);
        setStep(2); 
      } else { 
        setAmount('');
        setDate(new Date().toISOString().slice(0, 16)); // Bez času
        setCategory('');
        setLocation('');
        setNote('');
        setRecurrence('none');
        setStopDate('');
        setStep(0); 
        setCameFromScanner(false);
        setIsAnalyzing(false);
        setPreviewImage(null); // Reset náhledu
      }
    }
  }, [open, expenseToEdit]);

  // Zapnutí/vypnutí kamery s ohledem na preview
  useEffect(() => {
    let isActive = true; // Prevence memory leaku, pokud se dialog zavře dřív, než se promise vyřeší

    // Kameru chceme jen na kroku 1, když se neanalyzuje nebo nekoukáme na náhled
    if (step === 1 && open && !isAnalyzing && !previewImage) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (!isActive) { // Dialog se zavřel
            stream.getTracks().forEach(track => track.stop());
            return;
          }
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        })
        .catch(err => {
          if (isActive) console.error('CAMERA_NOT_AVAILABLE', err);
        });
    }

    // Cleanup
    return () => {
      isActive = false; 
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [step, open, isAnalyzing, previewImage]);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const missing: string[] = [];
    if (!amount) missing.push(t('wizard.amount'));
    if (!date) missing.push(t('wizard.dateTime'));
    if (!category) missing.push(t('wizard.category'));

    if (missing.length > 0) {
      setShowErrors(true);
      showSnackbar(`${t('wizard.requiredFieldsAlert')}: ${missing.join(', ')}`, 'error');
      return;
    }

    const expenseData = {
      amount: Number(amount),
      date: dayjs(date).toISOString(), 
      category,
      location: location.trim() || undefined,
      note: note.trim() || undefined,
      recurrence
    };

    if (expenseToEdit) {
      updateExpense({ ...expenseData, uuid: expenseToEdit.uuid, recurringGroupId: expenseToEdit.recurringGroupId });
    } else {
      const parsedStopDate = stopDate ? dayjs(stopDate).endOf('day').toDate() : undefined;
      addExpense(expenseData, parsedStopDate);
    }
    handleClose();
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.length > 80) {
        showSnackbar(t('wizard.locationLimitAlert'), 'warning');
        setLocation(val.slice(0, 80));
      } else {
        setLocation(val);
      }
    };

    const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val.length > 250) {
        showSnackbar(t('wizard.noteLimitAlert'), 'warning');
        setNote(val.slice(0, 250));
      } else {
        setNote(val);
      }
    };

  // Odeslání potvrzené fotky na API
  const handleAnalyzeConfirmedImage = async () => {
    if (!previewImage) return;
    
    setIsAnalyzing(true);
    try {
      // Předáváme jména kategorií pro LLM
      const catNames = categories.map(c => c.name);
      const aiData = await analyzeReceiptWithAI(previewImage, catNames);
      
      // Zpracování dat od LLM
      if (aiData.amount) setAmount(aiData.amount.toString());
      if (aiData.location) setLocation(aiData.location);
      
      // Zajištění striktního formátu pro Picker
      if (aiData.date) {
        const parsedDate = dayjs(aiData.date);
        if (parsedDate.isValid()) {
          setDate(parsedDate.format('YYYY-MM-DDTHH:mm'));
        }
      }
      
      if (aiData.category && catNames.includes(aiData.category)) {
        setCategory(aiData.category);
      }

      setCameFromScanner(true);
      setStep(2);
    } catch (error) {
      console.error('AI_ANALYSIS_FAILED', error);
      
      if (error instanceof Error) {
        if (error.message === 'MISSING_API_KEY') {
          alert(t('wizard.aiMissingKeyError'));
        } else if (error.message.includes("503")) {
          alert(t('wizard.aiBusyAlert'));
        } else if (error.message.includes("API key not valid")) {
          alert(t('wizard.aiKeyInvalidAlert'));
        } else {
          alert(t('wizard.aiReadFailedAlert'));
        }
      } else {
        // Fallback, pokud by spadlo něco, co není Error objekt
        alert(t('wizard.aiReadFailedAlert'));
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Zobrazí náhled
  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        setPreviewImage(base64);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) setPreviewImage(base64); // Zastaví se u náhledu
      };
      reader.readAsDataURL(file);
    }
    // Vyčistí output, aby šel dvakrát po sobě nahrát stejný soubor
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Vykreslení kroků
  // Volba mezi formulářem/detekcí ze snímku
  const renderStep0 = () => (
    <Stack spacing={3} alignItems="center" justifyContent="center" sx={{ height: '100%', py: 4 }}>
      <Button 
        variant="contained" size="large" startIcon={<Camera size={24} />} 
        onClick={() => setStep(1)} sx={{ width: '80%', py: 2, borderRadius: 3 }}
      >
        {t('wizard.scanReceipt')}
      </Button>
      <Button 
        variant="outlined" size="large" startIcon={<Edit3 size={24} />} 
        onClick={() => {
          setAmount('');
          setDate(new Date().toISOString().slice(0, 16));
          setCategory('');
          setLocation('');
          setNote('');
          setRecurrence('none');
          setStopDate('');

          setCameFromScanner(false);
          setStep(2);
        }} 
        sx={{ width: '80%', py: 2, borderRadius: 3 }}
      >
        {t('wizard.enterManual')}
      </Button>
    </Stack>
  );

  // Kamera/Náhled
  const renderStep1 = () => (
    <Stack spacing={2} sx={{ height: '100%', position: 'relative' }}>
      <Box sx={{ flexGrow: 1, backgroundColor: '#000', borderRadius: 2, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        
        {/* Náhled nebo kamera*/}
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={t('wizard.previewAlt')} 
            style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: isAnalyzing ? 0.3 : 1 }} 
          />
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        )}
        
        {/* Zmrazení dialogu do vyřízení API requestu */}
        {isAnalyzing && (
          <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fff' }}>
            <CircularProgress color="inherit" sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight="bold">{t('wizard.analyzing')}</Typography>
          </Box>
        )}
      </Box>

      {/* Tlačítka podle toho, jestli máme náhled */}
      <Stack direction="row" spacing={2} justifyContent="center">
        {previewImage ? (
          <>
            {/* Znovu vyfotit nebo nahrát/odeslat k analýze */}
            <Button variant="outlined" onClick={() => setPreviewImage(null)} disabled={isAnalyzing} sx={{ flexGrow: 1 }}>
              {t('wizard.retry')}
            </Button>
            <Button variant="contained" onClick={handleAnalyzeConfirmedImage} disabled={isAnalyzing} sx={{ flexGrow: 1 }}>
              {t('wizard.sendForAnalysis')}
            </Button>
          </>
        ) : (
          <>
            {/* Vyfotit/nahrát */}
            <Button variant="contained" onClick={handleCapture} sx={{ flexGrow: 1 }}>
              {t('wizard.takePhoto')}
            </Button>
            <Button variant="outlined" onClick={() => fileInputRef.current?.click()} startIcon={<Upload size={18} />}>
              {t('wizard.upload')}
            </Button>
          </>
        )}
        
        <input 
          type="file" accept="image/*" ref={fileInputRef} 
          style={{ display: 'none' }} onChange={handleFileUpload}
        />
      </Stack>
    </Stack>
  );

  // Formulář
  const renderStep2 = () => (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={datePickerAdapterLocale}
      localeText={muiLocaleText.datePicker}
    >
      <Stack spacing={2.5} sx={{ mt: 1 }}>
      <TextField
        label={t('wizard.amount')}
        type="text"
        inputMode="decimal"
        value={amount}
        error={showErrors && !amount}
        onChange={(e) => {
          let val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');

          // Zabrání vícero tečkám
          const parts = val.split('.');
          if (parts.length > 2) {
            val = parts[0] + '.' + parts.slice(1).join('');
          }
        
          // Limitace na dvě desetinná místa
          if (val.includes('.')) {
            const [whole, decimal] = val.split('.');
            if (decimal && decimal.length > 2) {
              val = `${whole}.${decimal.slice(0, 2)}`;
              showSnackbar(t('wizard.decimalLimitAlert'), 'warning');
            }
          }
        
          // Zastropování maximální částky
          if (Number(val) > 999999999999) {
            val = '999999999999';
            showSnackbar(t('wizard.amountLimitAlert'), 'warning');
          }

          setAmount(val);
          if (showErrors && val) setShowErrors(false);
        }}
        slotProps={{ input: { endAdornment: <InputAdornment position="end">{defaultCurrency}</InputAdornment> }}}
        required
      />

      <DateTimePicker
        label={t('wizard.dateTime')}
        value={date ? dayjs(date) : null}
        onChange={(value: Dayjs | null) => {
          if (!value || !value.isValid()) {
            setDate('');
            return;
          }

          const formattedDate = value.format('YYYY-MM-DDTHH:mm');
          setDate(formattedDate);
          if (showErrors) setShowErrors(false);

          if (stopDate && isStopDateBeforeExpenseDate(stopDate, formattedDate)) {
            clearInvalidStopDate();
          }
        }}
        ampm={datePickerAdapterLocale === 'en'}
        views={['year', 'month', 'day', 'hours', 'minutes']}
        slotProps={{
          textField: {
            required: true,
            error: showErrors && !date
          }
        }}
      />

      <FormControl required error={showErrors && !category}>
        <InputLabel>{t('wizard.category')}</InputLabel>
        <Select 
          value={category} 
          label={t('wizard.category')} 
          onChange={(e) => {
            setCategory(e.target.value);
            if (showErrors && e.target.value) setShowErrors(false);
          }}
        >
          {categories.map(c => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
        </Select>
      </FormControl>

      <TextField 
        label={t('wizard.location')} 
        value={location} 
        onChange={handleLocationChange} 
        slotProps={{ htmlInput: { maxLength: 81 } }} // 81, aby handler zabránil překročení na 80
      />

      <TextField 
        label={t('wizard.note')} 
        value={note} 
        onChange={handleNoteChange} 
        multiline 
        rows={2} 
        slotProps={{ htmlInput: { maxLength: 251 } }} // Analogicky
      />

      <FormControl disabled={!!expenseToEdit}>
        <InputLabel>{t('wizard.recurrence')}</InputLabel>
        <Select value={recurrence} label={t('wizard.recurrence')} onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}>
          <MenuItem value="none">{t('recurrence.none')}</MenuItem>
          <MenuItem value="daily">{t('recurrence.daily')}</MenuItem>
          <MenuItem value="weekly">{t('recurrence.weekly')}</MenuItem>
          <MenuItem value="monthly">{t('recurrence.monthly')}</MenuItem>
          <MenuItem value="yearly">{t('recurrence.yearly')}</MenuItem>
        </Select>
        {expenseToEdit && (
          <FormHelperText>
            {t('wizard.recurrenceLockedHelper')}
          </FormHelperText>
        )}
      </FormControl>

      {!expenseToEdit && recurrence !== 'none' && (
        <DatePicker
          label={t('wizard.generateUntil')}
          value={stopDate ? dayjs(stopDate) : null}
          onChange={(value: Dayjs | null) => {
            if (!value || !value.isValid()) {
              setStopDate('');
              return;
            }

            const newStopDate = value.format('YYYY-MM-DD');
            if (date && isStopDateBeforeExpenseDate(newStopDate, date)) {
              clearInvalidStopDate();
              return;
            }

            setStopDate(newStopDate);
          }}
          format="L"
          slotProps={{
            textField: {
              helperText: t('wizard.generateUntilHelper')
            }
          }}
        />
      )}
      </Stack>
    </LocalizationProvider>
  );

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div" fontWeight="bold">
            {expenseToEdit ? t('wizard.titleEdit') : t('wizard.titleNew')}
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={isAnalyzing}>
            <X />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: (step > 0 && !expenseToEdit) ? 'space-between' : 'flex-end' }}>
          {step > 0 && !expenseToEdit && (
            <Button 
              disabled={isAnalyzing}
              onClick={() => {
                if (step === 2 && !cameFromScanner) { // Pro zajištění konzistence
                  setStep(0); 
                } else if (step === 1 && previewImage) {
                  setPreviewImage(null); // Z náhledu se vrátí na kameru
                } else {
                  setStep(step - 1);
                }
              }} 
              color="inherit"
            >
              {t('common.back')}
            </Button>
          )}

          {/* Uložit změny/nový výdaj */}
          {step === 2 && (
            <Button variant="contained" color="primary" onClick={handleSave}>
              {expenseToEdit ? t('wizard.saveChanges') : t('wizard.saveNew')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar s chybějícími povinnými poli */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddExpenseWizard;