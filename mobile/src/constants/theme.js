export const theme = {
    colors: {
        primary: '#2563EB',      // Rich Royal Blue
        secondary: '#0F172A',    // Deep Slate (almost black)
        accent: '#F59E0B',       // Amber Gold
        background: '#F8FAFC',   // Cool Light Slate
        surface: '#FFFFFF',      // Pure White
        text: '#1E293B',         // Slate 800
        textSecondary: '#64748B', // Slate 500
        error: '#EF4444',        // Red 500
        success: '#10B981',      // Emerald 500
        warning: '#F59E0B',      // Amber 500
        border: '#E2E8F0',       // Slate 200
        white: '#FFFFFF',
        black: '#000000',

        // Navigation / Tab Colors
        activeTab: '#2563EB',
        inactiveTab: '#F1F5F9',
        tabTextActive: '#2563EB',
        tabTextInactive: '#64748B',

        // Gradients & Specials
        buttonGradient: ['#2563EB', '#1D4ED8'],

        // Specific Feature Colors
        brandBlue: '#2563EB',
        brandTeal: '#0D9488',
        cardShadow: 'rgba(15, 23, 42, 0.08)',

        // Table & Card Specific
        tableHeader: '#F1F5F9',
        tableBorder: '#E2E8F0',
        rowAlternate: '#F8FAFC',

        // Badges
        badgeReferralBg: '#EFF6FF',
        badgeReferralText: '#1D4ED8',
        badgeDetailedBg: '#F0FDF4',
        badgeDetailedText: '#15803D',
        badgeWarningBg: '#FFFBEB',
        badgeWarningText: '#B45309',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
        section: 40,
    },
    borderRadius: {
        sm: 6,
        md: 12,
        lg: 16,
        xl: 24,
        round: 9999,
    },
    typography: {
        h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, color: '#0F172A' },
        h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3, color: '#0F172A' },
        h3: { fontSize: 18, fontWeight: '600', letterSpacing: -0.2, color: '#1E293B' },
        body: { fontSize: 15, fontWeight: '400', lineHeight: 22, color: '#334155' },
        bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20, color: '#64748B' },
        caption: { fontSize: 13, fontWeight: '500', lineHeight: 18, color: '#64748B' },
        label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    },
    shadow: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 4,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    }
};

export default theme;
