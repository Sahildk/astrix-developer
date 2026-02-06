export const KEYWORD_MAPPING: Record<string, string[]> = {
    'Safety': ['fire', 'wire', 'danger', 'smoke', 'shock', 'spark', 'collapse', 'crack', 'gas', 'leak', 'toxic', 'poison', 'unsafe', 'hazard'],
    'Maintenance': ['broken', 'water', 'elevator', 'lift', 'dirty', 'mold', 'pipe', 'plumbing', 'repair', 'fix', 'leakage', 'sewage', 'garbage', 'trash', 'waste', 'light', 'paint', 'wall', 'roof', 'damp'],
    'Harassment': ['harass', 'yell', 'threat', 'enter', 'intrud', 'shout', 'abuse', 'follow', 'stalk', 'privacy', 'watch', 'camera', 'force', 'knock', 'bother', 'disturb'],
    'Discrimination': ['diet', 'religion', 'caste', 'married', 'bachelor', 'food', 'veg', 'non-veg', 'muslim', 'hindu', 'christian', 'sikh', 'dalit', 'tribe', 'gender', 'female', 'single', 'partner'],
};

export function categorizeText(text: string): string | null {
    const lower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(KEYWORD_MAPPING)) {
        if (keywords.some(k => lower.includes(k))) {
            return category.toLowerCase().replace(' ', '-');
        }
    }
    if (lower.includes('rent') || lower.includes('deposit') || lower.includes('money')) return 'unfair-rent';
    return null;
}
