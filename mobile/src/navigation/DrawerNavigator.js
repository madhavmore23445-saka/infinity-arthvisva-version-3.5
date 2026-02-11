import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AppTabs from './AppTabs';
import CustomDrawerContent from '../components/CustomDrawerContent';
import ProfileScreen from '../screens/ProfileScreen';
import BackButton from '../components/common/BackButton';
import theme from '../constants/theme';
import AppHeader from '../components/common/AppHeader.js';

// Screens
import HomeLoanScreen from '../screens/products/HomeLoanScreen';
import CarLoanScreen from '../screens/products/CarLoanScreen';
import InsuranceScreen from '../screens/products/InsuranceScreen';
import MutualFundScreen from '../screens/products/MutualFundScreen';
import InvestmentScreen from '../screens/products/InvestmentScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import LeadManagementScreen from '../screens/dashboard/referral/LeadManagementScreen';
import ClientPortfolioScreen from '../screens/dashboard/clientPortfolio/ClientPortfolioScreen';
import IncentivesScreen from '../screens/secondary/IncentivesScreen';
import MarketingScreen from '../screens/secondary/MarketingScreen';
import DownloadsScreen from '../screens/secondary/DownloadsScreen';
import TestScreen from '../screens/test/TestScreen';

// Hidden Forms
import AddDetailedLeadScreen from '../screens/dashboard/detailed/AddDetailedLeadScreen';
import HomeLoanFormScreen from '../screens/dashboard/detailed/forms/loans/HomeLoanFormScreen';
import PersonalLoanFormScreen from '../screens/dashboard/detailed/forms/loans/PersonalLoanFormScreen';
import BusinessLoanFormScreen from '../screens/dashboard/detailed/forms/loans/BusinessLoanFormScreen';
import EducationLoanFormScreen from '../screens/dashboard/detailed/forms/loans/EducationLoanFormScreen';
import MortgageLoanFormScreen from '../screens/dashboard/detailed/forms/loans/MortgageLoanFormScreen';
import SMELoanFormScreen from '../screens/dashboard/detailed/forms/loans/SMELoanFormScreen';
import NRPLoanFormScreen from '../screens/dashboard/detailed/forms/loans/NRPLoanFormScreen';
import VehicleLoanFormScreen from '../screens/dashboard/detailed/forms/loans/VehicleLoanFormScreen';
import LoanAgainstSecuritiesFormScreen from '../screens/dashboard/detailed/forms/loans/LoanAgainstSecuritiesFormScreen';
import CattleInsuranceFormScreen from '../screens/dashboard/detailed/forms/insurance/CattleInsuranceFormScreen';
import TravelInsuranceFormScreen from '../screens/dashboard/detailed/forms/insurance/TravelInsuranceFormScreen';
import LifeInsuranceFormScreen from '../screens/dashboard/detailed/forms/insurance/LifeInsuranceFormScreen';
import HealthInsuranceFormScreen from '../screens/dashboard/detailed/forms/insurance/HealthInsuranceFormScreen';
import LoanProtectorFormScreen from '../screens/dashboard/detailed/forms/insurance/LoanProtectorFormScreen.js';
import CorporateInsuranceFormScreen from '../screens/dashboard/detailed/forms/insurance/CorporateInsuranceFormScreen.js';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: theme.colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                    color: theme.colors.text,
                },
                drawerStyle: {
                    width: '82%', // Slightly wider for better readability
                    backgroundColor: theme.colors.background,
                },
                headerLeft: () => <BackButton />,
                drawerType: 'front', // Smooth sliding over content
                overlayColor: 'rgba(15, 23, 42, 0.6)', // Darker, premium overlay
            }}
        >
            <Drawer.Screen
                name="MainTabs"
                component={AppTabs}
                options={{
                    header: () => <AppHeader />,
                }}
            />

            <Drawer.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'My Profile' }}
            />

            {/* Test Screen */}
            <Drawer.Screen
                name="Test"
                component={TestScreen}
                options={{ title: 'Test Screen' }}
            />

            {/* Products */}
            <Drawer.Screen name="HomeLoan" component={HomeLoanScreen} options={{ title: 'Home Loan' }} />
            <Drawer.Screen name="CarLoan" component={CarLoanScreen} options={{ title: 'Car Loan' }} />
            <Drawer.Screen name="Insurance" component={InsuranceScreen} options={{ title: 'Insurance' }} />
            <Drawer.Screen name="MutualFund" component={MutualFundScreen} options={{ title: 'Mutual Fund' }} />
            <Drawer.Screen name="Investment" component={InvestmentScreen} options={{ title: 'Investment' }} />

            {/* Dashboard / Primary */}
            <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
            <Drawer.Screen name="LeadManagement" component={LeadManagementScreen} options={{ title: 'Lead Management' }} />

            {/* Secondary */}
            <Drawer.Screen name="ClientPortfolio" component={ClientPortfolioScreen} options={{ title: 'Client Portfolio' }} />
            <Drawer.Screen name="Incentives" component={IncentivesScreen} options={{ title: 'Incentives & Payouts' }} />
            <Drawer.Screen name="Marketing" component={MarketingScreen} options={{ title: 'Marketing Campaign' }} />
            <Drawer.Screen name="Downloads" component={DownloadsScreen} options={{ title: 'Downloads' }} />

            {/* HIDDEN SCREENS (Forms & Details) */}
            <Drawer.Screen
                name="AddDetailedLead"
                component={AddDetailedLeadScreen}
                options={{
                    title: 'Add Detailed Lead',
                    headerShown: false,
                    drawerItemStyle: { display: 'none' }
                }}
            />
            {/* ... Loan Forms ... */}
            <Drawer.Screen name="HomeLoanForm" component={HomeLoanFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="PersonalLoanForm" component={PersonalLoanFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="BusinessLoanForm" component={BusinessLoanFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="EducationLoanForm" component={EducationLoanFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="MortgageLoanForm" component={MortgageLoanFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="SMELoanForm" component={SMELoanFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="NRPLoanForm" component={NRPLoanFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="VehicleLoanForm" component={VehicleLoanFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="LoanAgainstSecuritiesForm" component={LoanAgainstSecuritiesFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />

            {/* ..................insurance forms.................. */}
            <Drawer.Screen name="CattleInsuranceForm" component={CattleInsuranceFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="TravelInsuranceForm" component={TravelInsuranceFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="LifeInsuranceForm" component={LifeInsuranceFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="HealthInsuranceForm" component={HealthInsuranceFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />

            <Drawer.Screen name="LoanProtectorForm" component={LoanProtectorFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />

            <Drawer.Screen name="CorporateInsuranceForm" component={CorporateInsuranceFormScreen} options={{ headerShown: false, drawerItemStyle: { display: 'none' } }} />

        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
