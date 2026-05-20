import { csCZ as datePickerCsCZ, enUS as datePickerEnUS } from '@mui/x-date-pickers/locales';
import { csCZ as dataGridCsCZ, enUS as dataGridEnUS } from '@mui/x-data-grid/locales';

import type { Language } from '../types/settings';
import type { RecurrenceType } from '../types/common';

type Vars = Record<string, string | number>; // Pro klíče se zástupným symbolem třeba {name}

type TranslationMap = Record<string, string> 
type Translations = Record<string, TranslationMap>;

const translations: Translations = {
  cs: {
    'common.add': 'Přidat',
    'common.back': 'Zpět',
    'common.cancel': 'Zrušit',
    'common.delete': 'Smazat',
    'common.done': 'Hotovo',
    'common.edit': 'Upravit',
    'common.save': 'Uložit',
    'common.understood': 'Rozumím',

    'language.cs': 'Čeština',
    'language.en': 'English',

    'settings.title': 'Nastavení',
    'settings.general': 'OBECNÉ',
    'settings.languageLabel': 'Jazyk aplikace',
    'settings.categoriesSection': 'SPRÁVA KATEGORIÍ',
    'settings.newCategory': 'Nová kategorie',
    'settings.categoryExists': 'Kategorie s tímto názvem již existuje.',
    'settings.colorTitle': 'Barva pro grafy',
    'settings.aboutButton': 'O aplikaci',
    'settings.aboutTitle': 'O aplikaci',
    'settings.aboutAuthorLabel': 'Autor',
    'settings.aboutStudentLabel': 'Studijní číslo',
    'settings.aboutPurposeLabel': 'Účel',
    'settings.aboutPurposeText': 'Aplikace pro správu a analýzu výdajů.',
    'settings.exportFailedAlert': 'Export dat selhal.',
    'settings.exportFailedLog': 'Chyba při exportu dat:',
    'settings.importInvalidLog': 'Neplatný formát zálohy:',
    'settings.delete.cannotTitle': 'Nelze smazat',
    'settings.delete.deleteTitle': 'Smazat kategorii',
    'settings.delete.usedText': 'Kategorii "{name}" nelze smazat, protože ji používají existující výdaje. Pokud ji chcete smazat, musíte nejprve tyto výdaje upravit nebo odstranit.',
    'settings.delete.confirmText': 'Opravdu chcete nenávratně smazat kategorii "{name}"?',
    'settings.delete.deletedText': 'Kategorie "{name}" byla smazána.',
    'settings.categoryNameLimit' : 'Název kategorie je příliš dlouhý. (Max 28 znaků)',

    'wizard.titleNew': 'Nový výdaj',
    'wizard.titleEdit': 'Upravit výdaj',
    'wizard.scanReceipt': 'Naskenovat účtenku',
    'wizard.enterManual': 'Zadat manuálně',
    'wizard.previewAlt': 'Náhled účtenky',
    'wizard.analyzing': 'Analyzuji účtenku...',
    'wizard.retry': 'Znovu',
    'wizard.sendForAnalysis': 'Odeslat k analýze',
    'wizard.takePhoto': 'Vyfotit',
    'wizard.upload': 'Nahrát',
    'wizard.amount': 'Částka',
    'wizard.dateTime': 'Datum a čas',
    'wizard.category': 'Kategorie',
    'wizard.location': 'Místo (podnik)',
    'wizard.note': 'Poznámka',
    'wizard.recurrence': 'Opakování',
    'wizard.recurrenceLockedHelper': 'Opakování nelze upravit zpětně. Pro změnu výdaj smažte a vytvořte nový.',
    'wizard.generateUntil': 'Generovat do data (nepovinné)',
    'wizard.generateUntilHelper': 'Pokud nevyplníte, vygenerují se platby na 2 roky dopředu.',
    'wizard.generateUntilInvalidAlert': 'Datum konce generování nesmí být menší než datum výdaje.',
    'wizard.saveNew': 'Vytvořit výdaj',
    'wizard.saveChanges': 'Uložit změny',
    'wizard.requiredFieldsAlert': 'Doplňte povinné údaje: ',
    'wizard.aiBusyAlert': 'Servery umělé inteligence jsou momentálně přetížené. Zkuste to prosím za minutu, nebo zadejte výdaj ručně.',
    'wizard.aiKeyInvalidAlert': 'Chyba ověření. Zkontrolujte, zda máte správně nastavený Gemini API klíč v souboru .env.local.',
    'wizard.aiReadFailedAlert': 'Nepodařilo se přečíst účtenku. Fotka je možná rozmazaná, nebo selhalo připojení.',
    'wizard.aiMissingKeyError': 'Chybí Gemini API klíč!',
    'wizard.amountLimitAlert': 'Počet číslic překročen. (max 12 číslic)',
    'wizard.decimalLimitAlert': 'Počet desetinných míst překročen. (max 2 desetinná místa)',
    'wizard.locationLimitAlert': 'Počet znaků pro lokaci překročen. (max 80 znaků)',
    'wizard.noteLimitAlert': 'Počet znaků pro poznámku. (max 250 znaků)',

    'recurrence.none': 'Neopakuje se',
    'recurrence.daily': 'Denně',
    'recurrence.weekly': 'Týdně',
    'recurrence.monthly': 'Měsíčně',
    'recurrence.yearly': 'Ročně',

    'recurrence.short.none': 'Ne',
    'recurrence.short.daily': 'Denně',
    'recurrence.short.weekly': 'Týdně',
    'recurrence.short.monthly': 'Měsíčně',
    'recurrence.short.yearly': 'Ročně',

    'expense.delete.title': 'Smazat výdaj',
    'expense.delete.confirmText': 'Opravdu chcete nenávratně smazat tento výdaj?',
    'expense.delete.recurringNotice': 'Tento výdaj se pravidelně opakuje.',
    'expense.delete.onlyThis': 'Smazat pouze tento výdaj',
    'expense.delete.allFuture': 'Smazat tento a všechny stejné následující a opakující se výdaje',

    'expense.emptyList': 'Zatím nebyly zadány žádné výdaje, nebo byly všechny vyfiltrovány.',
    'expense.category': 'Kategorie',
    'expense.location': 'Místo',
    'expense.note': 'Poznámka',
    'expense.recurrence': 'Opakování',
    'expense.amount': 'Částka',
    'expense.dateTime': 'Datum a čas',
    'expense.actions': 'Akce',

    'toolbar.addExpense': 'Přidat výdaj',
    'toolbar.period': 'Období',
    'toolbar.period.all': 'Vše',
    'toolbar.period.today': 'Dnes',
    'toolbar.period.thisweek': 'Tento týden',
    'toolbar.period.thismonth': 'Tento měsíc',
    'toolbar.period.thisyear': 'Tento rok',
    'toolbar.period.custom': 'Vlastní',
    'toolbar.period.from': 'Od',
    'toolbar.period.to': 'Do',
    'toolbar.period.rangePlaceholder': 'Bez omezení',
    'toolbar.period.clear': 'Vymazat',
    'toolbar.period.apply': 'Použít',
    'toolbar.category': 'Kategorie',
    'toolbar.category.all': 'Všechny kategorie',
    'toolbar.recurrence': 'Opakování',
    'toolbar.recurrence.all': 'Všechny platby',
    'toolbar.recurrence.recurring': 'Jen opakující se',
    'toolbar.recurrence.oneTime': 'Jednorázové',
    'toolbar.onlyInPastOrNow': 'Zobrazit jen uskutečněné výdaje',

    'header.title': 'Expenditure Tracker',
    'header.exportJson': 'Export JSON',
    'header.importJson': 'Import JSON',
    'header.importInvalid': 'Chyba: Neplatný formát souboru.',
    'header.importDialog.title': 'Nenávratná akce',
    'header.importDialog.fileIntro': 'Chystáte se nahrát zálohu ze souboru',
    'header.importDialog.warning': 'Tato akce nenávratně smaže a přepíše všechny vaše aktuální výdaje a nastavení. Všechna data, která jste zadali od exportování poslední zálohy, budou ztracena.',
    'header.importDialog.confirm': 'Opravdu chcete pokračovat?',
    'header.importDialog.confirmButton': 'Přepsat všechna data',

    'nav.expenses': 'Výdaje',
    'nav.add': 'Přidat',
    'nav.statistics': 'Statistiky',

    'stats.totalSpent': 'Celkem bude/bylo utraceno',
    'stats.dailyAverage': 'Denní průměr',
    'stats.mostExpensiveCategory': 'Nejdražší kategorie',

    'spentSummary.title': 'Již utraceno',
    'spentSummary.for': 'za',
    'spentSummary.period.today': 'dnešek',
    'spentSummary.period.thisweek': 'tento týden',
    'spentSummary.period.thismonth': 'tento měsíc',
    'spentSummary.period.thisyear': 'tento rok',
    'spentSummary.period.all': 'celé období',

    'charts.historyPlannedBarChartLabel': 'Historie a plánované výdaje',
    'charts.spent': 'Utraceno',
    'charts.planned': 'Plánováno',
    'charts.noData': 'Žádná data pro tento měsíc.',

    'upcomingBills.title': 'Nejbližší tři plánované výdaje',
    'upcomingBills.none': 'Žádné nadcházející platby nenalezeny.'
  },
  en: {
    'common.add': 'Add',
    'common.back': 'Back',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.done': 'Done',
    'common.edit': 'Edit',
    'common.save': 'Save',
    'common.understood': 'Understood',

    'language.cs': 'Czech',
    'language.en': 'English',

    'settings.title': 'Settings',
    'settings.general': 'GENERAL',
    'settings.languageLabel': 'App language',
    'settings.categoriesSection': 'CATEGORY MANAGEMENT',
    'settings.newCategory': 'New category',
    'settings.categoryExists': 'A category with this name already exists.',
    'settings.colorTitle': 'Chart color',
    'settings.aboutButton': 'About app',
    'settings.aboutTitle': 'About',
    'settings.aboutAuthorLabel': 'Author',
    'settings.aboutStudentLabel': 'Student ID',
    'settings.aboutPurposeLabel': 'Purpose',
    'settings.aboutPurposeText': 'App for managing and analyzing expenses.',
    'settings.exportFailedAlert': 'Export failed.',
    'settings.exportFailedLog': 'Export error:',
    'settings.importInvalidLog': 'Invalid backup format:',
    'settings.delete.cannotTitle': 'Cannot delete',
    'settings.delete.deleteTitle': 'Delete category',
    'settings.delete.usedText': 'Category "{name}" cannot be deleted because it is used by existing expenses. To delete it, edit or remove those expenses first.',
    'settings.delete.confirmText': 'Do you really want to permanently delete the category "{name}"?',
    'settings.delete.deletedText': 'Category "{name}" has been deleted.',
    'settings.categoryNameLimit' : 'Category name is too long. (max 28 characters)',

    'wizard.titleNew': 'New expense',
    'wizard.titleEdit': 'Edit expense',
    'wizard.scanReceipt': 'Scan receipt',
    'wizard.enterManual': 'Enter manually',
    'wizard.previewAlt': 'Receipt preview',
    'wizard.analyzing': 'Analyzing receipt...',
    'wizard.retry': 'Retry',
    'wizard.sendForAnalysis': 'Send for analysis',
    'wizard.takePhoto': 'Take photo',
    'wizard.upload': 'Upload',
    'wizard.amount': 'Amount',
    'wizard.dateTime': 'Date and time',
    'wizard.category': 'Category',
    'wizard.location': 'Location (merchant)',
    'wizard.note': 'Note',
    'wizard.recurrence': 'Recurrence',
    'wizard.recurrenceLockedHelper': 'Recurrence cannot be edited later. Delete the expense and create a new one.',
    'wizard.generateUntil': 'Generate until date (optional)',
    'wizard.generateUntilHelper': 'If empty, payments are generated for 2 years ahead.',
    'wizard.generateUntilInvalidAlert': 'Generate-until date cannot be earlier than the expense date.',
    'wizard.saveNew': 'Create expense',
    'wizard.saveChanges': 'Save changes',
    'wizard.requiredFieldsAlert': 'Fill in required fields: ',
    'wizard.aiBusyAlert': 'AI servers are currently overloaded. Please try again in a minute or enter the expense manually.',
    'wizard.aiKeyInvalidAlert': 'Verification error. Check that your Gemini API key is set correctly in .env.local.',
    'wizard.aiReadFailedAlert': 'Could not read the receipt. The photo may be blurry or the connection failed.',
    'wizard.aiMissingKeyError': 'Missing Gemini API key!',
    'wizard.amountLimitAlert': 'Digit limit exceeded. (Max 12 digits)',
    'wizard.decimalLimitAlert': 'Decimal places limit exceeded. (max 2 decimal places)',
    'wizard.locationLimitAlert': 'Character limit exceeded for location. (max 80 characters)',
    'wizard.noteLimitAlert': 'Character limit exceeded for note. (max 250 characters)',

    'recurrence.none': 'Does not repeat',
    'recurrence.daily': 'Daily',
    'recurrence.weekly': 'Weekly',
    'recurrence.monthly': 'Monthly',
    'recurrence.yearly': 'Yearly',

    'recurrence.short.none': 'No',
    'recurrence.short.daily': 'Daily',
    'recurrence.short.weekly': 'Weekly',
    'recurrence.short.monthly': 'Monthly',
    'recurrence.short.yearly': 'Yearly',

    'expense.delete.title': 'Delete expense',
    'expense.delete.confirmText': 'Do you really want to permanently delete this expense?',
    'expense.delete.recurringNotice': 'This expense repeats regularly.',
    'expense.delete.onlyThis': 'Delete only this expense',
    'expense.delete.allFuture': 'Delete this and all following repeating expenses',

    'expense.emptyList': 'No expenses have been entered yet, or all were filtered out.',
    'expense.category': 'Category',
    'expense.location': 'Location',
    'expense.note': 'Note',
    'expense.recurrence': 'Recurrence',
    'expense.amount': 'Amount',
    'expense.dateTime': 'Date and time',
    'expense.actions': 'Actions',

    'toolbar.addExpense': 'Add expense',
    'toolbar.period': 'Period',
    'toolbar.period.all': 'All',
    'toolbar.period.today': 'Today',
    'toolbar.period.thisweek': 'This week',
    'toolbar.period.thismonth': 'This month',
    'toolbar.period.thisyear': 'This year',
    'toolbar.period.custom': 'Custom',
    'toolbar.period.from': 'From',
    'toolbar.period.to': 'To',
    'toolbar.period.rangePlaceholder': 'No limit',
    'toolbar.period.clear': 'Clear',
    'toolbar.period.apply': 'Apply',
    'toolbar.category': 'Category',
    'toolbar.category.all': 'All categories',
    'toolbar.recurrence': 'Recurrence',
    'toolbar.recurrence.all': 'All payments',
    'toolbar.recurrence.recurring': 'Recurring only',
    'toolbar.recurrence.oneTime': 'One-time',
    'toolbar.onlyInPastOrNow': 'Show only past expenses',

    'header.title': 'Expenditure Tracker',
    'header.exportJson': 'Export JSON',
    'header.importJson': 'Import JSON',
    'header.importInvalid': 'Error: Invalid file format.',
    'header.importDialog.title': 'Irreversible action',
    'header.importDialog.fileIntro': 'You are about to load a backup file',
    'header.importDialog.warning': 'This action will permanently delete and overwrite all your current expenses and settings. Any data entered since the last backup export will be lost.',
    'header.importDialog.confirm': 'Do you want to continue?',
    'header.importDialog.confirmButton': 'Overwrite all data',

    'nav.expenses': 'Expenses',
    'nav.add': 'Add',
    'nav.statistics': 'Statistics',

    'stats.totalSpent': 'Total will be/were spent',
    'stats.dailyAverage': 'Daily average',
    'stats.mostExpensiveCategory': 'Most expensive category',

    'spentSummary.title': 'Already spent',
    'spentSummary.for': 'for',
    'spentSummary.period.today': 'today',
    'spentSummary.period.thisweek': 'this week',
    'spentSummary.period.thismonth': 'this month',
    'spentSummary.period.thisyear': 'this year',
    'spentSummary.period.all': 'all time',

    'charts.historyPlannedBarChartLabel': 'History and planned expenses',
    'charts.spent': 'Spent',
    'charts.planned': 'Planned',
    'charts.noData': 'No data for this month.',

    'upcomingBills.title': 'Next three planned expenses',
    'upcomingBills.none': 'No upcoming payments found.'
  }
};

export type SupportedLanguage = keyof typeof translations;

const defaultLanguage: SupportedLanguage = 'cs';

const resolveLanguage = (language: Language): SupportedLanguage =>
  (language in translations ? language as SupportedLanguage : defaultLanguage);

export const supportedLanguages = Object.keys(translations) as SupportedLanguage[];

const locales: Record<SupportedLanguage, string> = {
  cs: 'cs-CZ',
  en: 'en-US'
};

export type TranslationKey = keyof typeof translations.cs; // Vynucuje použití správných klíčů

export const t = (language: Language, key: TranslationKey, vars?: Vars) => {
  // Máme slovník pro jazyk?
  const resolved = resolveLanguage(language);
  
  // Text v hledaném jazyce ?? text v defaultním jazyce ?? klíč
  const template = translations[resolved][key] ?? translations[defaultLanguage][key] ?? key;
  
  // Žádné proměnné k nahrazení -> návrat
  if (!vars) return template;

  // Nahradí všechny klíče ve vars, nalezené v textu, jejich skutečnými hodnotami
  return Object.keys(vars).reduce((result, varKey) => {
    return result.replaceAll(`{${varKey}}`, String(vars[varKey]));
  }, template);
};

// Vrací formátovaný kód jazyka
export const getLocale = (language: Language) => locales[resolveLanguage(language)] || locales[defaultLanguage];

// Lokalizace pro MUI componenty
export const getMuiLocaleText = (language: Language) => {
  const resolved = resolveLanguage(language);
  const datePickerBundle = resolved === 'cs' ? datePickerCsCZ : datePickerEnUS;
  const dataGridBundle = resolved === 'cs' ? dataGridCsCZ : dataGridEnUS;

  return {
    datePicker: datePickerBundle.components.MuiLocalizationProvider.defaultProps.localeText,
    dataGrid: dataGridBundle.components.MuiDataGrid.defaultProps.localeText
  };
};

// Formát dat v kalendáři
export const getDatePickerAdapterLocale = (language: Language) => {
  const resolved = resolveLanguage(language);
  return resolved === 'cs' ? 'cs' : 'en';
};

const numberFormatCache = new Map<string, Intl.NumberFormat>();
const dateFormatCache = new Map<string, Intl.DateTimeFormat>();

export const formatNumber = (
  language: Language,
  value: number,
  options?: Intl.NumberFormatOptions
) => {
  const locale = getLocale(language);
  // Cache klíč na základě jazyka a konfigurace
  const cacheKey = `${locale}-${options ? JSON.stringify(options) : 'default'}`;
  
  // Memoizace
  if (!numberFormatCache.has(cacheKey)) {
    numberFormatCache.set(cacheKey, new Intl.NumberFormat(locale, options));
  }
  
  return numberFormatCache.get(cacheKey)!.format(value);
};

export const formatDate = (
  language: Language,
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions
) => {
  const locale = getLocale(language);
  const cacheKey = `${locale}-${options ? JSON.stringify(options) : 'default'}`;
  
  // Memoizace
  if (!dateFormatCache.has(cacheKey)) {
    dateFormatCache.set(cacheKey, new Intl.DateTimeFormat(locale, options));
  }
  
  // Převod na Date objekt, pokud přišel string
  const dateObj = value instanceof Date ? value : new Date(value);
  return dateFormatCache.get(cacheKey)!.format(dateObj);
};

const recurrenceKeyMap: Record<RecurrenceType, TranslationKey> = {
  none: 'recurrence.none',
  daily: 'recurrence.daily',
  weekly: 'recurrence.weekly',
  monthly: 'recurrence.monthly',
  yearly: 'recurrence.yearly'
};

const recurrenceShortKeyMap: Record<RecurrenceType, TranslationKey> = {
  none: 'recurrence.short.none',
  daily: 'recurrence.short.daily',
  weekly: 'recurrence.short.weekly',
  monthly: 'recurrence.short.monthly',
  yearly: 'recurrence.short.yearly'
};

export const getRecurrenceLabel = (language: Language, recurrence: RecurrenceType) =>
  t(language, recurrenceKeyMap[recurrence]);

export const getRecurrenceShortLabel = (language: Language, recurrence: RecurrenceType) =>
  t(language, recurrenceShortKeyMap[recurrence]);
