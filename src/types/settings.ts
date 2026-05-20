export interface Category {
  name: string;
  iconName: string; // Názvy z Lucide
  color?: string;  // Volitelně pro koláčový graf
}

export type Language = string;

export interface Settings {
  defaultCurrency: string;
  categories: Category[]; // uživatelsky měnitelný seznam
  language: Language;
}