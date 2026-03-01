import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../utils/theme';
import { useStreakStore } from '../hooks/useStore';
import moment from 'moment';

interface IRelapse {
    date: Date;
    // Add other properties if needed
}

interface ICheckIn {
    date: Date;
    succeeded: boolean;
    // Add other properties if needed
}

const WeeklyCheckinView = () => {
    const { checkIns, relapses, loading } = useStreakStore();

    const getWeekDays = () => {
        const days = [];
        const startOfWeek = moment().startOf('isoWeek');
        for (let i = 0; i < 7; i++) {
            days.push(startOfWeek.clone().add(i, 'days'));
        }
        return days;
    };

    const weekDays = getWeekDays();
    const today = moment();

    // Get the most recent relapse date
    const getMostRecentRelapse = () => {
        if (!relapses.length) return null;
        return relapses.reduce<IRelapse | null>((latest, current) => {
            if (!latest) return current;
            return moment(latest.date).isAfter(moment(current.date)) ? latest : current;
        }, null);
    };

    const getStatusForDay = (day: moment.Moment) => {
        if (day.isAfter(today, 'day')) {
            return 'future';
        }

        const dayString = day.format('YYYY-MM-DD');
        const mostRecentRelapse = getMostRecentRelapse();

        // If there's a relapse on this day
        const hasRelapseToday = relapses.some(r => 
            moment(r.date).format('YYYY-MM-DD') === dayString
        );
        if (hasRelapseToday) {
            return 'relapse';
        }

        // If this day is after the most recent relapse
        if (mostRecentRelapse && day.isAfter(moment(mostRecentRelapse.date))) {
            // Check if there's a check-in for this day
            const checkIn = checkIns.find(c => 
                moment(c.date).format('YYYY-MM-DD') === dayString && c.succeeded
            );
            
            return checkIn ? 'success' : 'empty';
        }

        // If it's today and loading, show pending
        if (day.isSame(today, 'day') && loading) {
            return 'pending';
        }

        // Check for successful check-ins for days before the most recent relapse
        const checkIn = checkIns.find(c => 
            moment(c.date).format('YYYY-MM-DD') === dayString && c.succeeded
        );

        if (checkIn) {
            return 'success';
        }

        return 'empty';
    };

    const getIcon = (status: string) => {
        switch (status) {
            case 'success':
                return { symbol: '+', color: COLORS.textPrimary };
            case 'relapse':
                return { symbol: '-', color: COLORS.textPrimary };
            case 'pending':
                return { symbol: '?', color: COLORS.textPrimary };
            case 'empty':
                return { symbol: '?', color: COLORS.textSecondary };
            case 'future':
                return { symbol: '?', color: COLORS.textSecondary };
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.weekContainer}>
                {weekDays.map((day, index) => {
                    const status = getStatusForDay(day);
                    const icon = getIcon(status);
                    const isToday = day.isSame(today, 'day');

                    const circleStyle = [
                        styles.circle,
                        (status === 'future' || status === 'pending') && styles.dimmedCircle,
                        isToday && styles.todayCircle,
                    ];

                    return (
                        <View key={index} style={styles.dayContainer}>
                            <View style={circleStyle}>
                                {icon && (
                                    <Text style={[styles.symbol, { color: icon.color }]}>
                                        {icon.symbol}
                                    </Text>
                                )}
                            </View>
                            <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                                {day.format('dd').charAt(0)}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: SPACING.xs,
        marginBottom: 10,
        marginTop: 0,
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    dayContainer: {
        alignItems: 'center',
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        backgroundColor: COLORS.background,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    dimmedCircle: {
        backgroundColor: COLORS.background,
    },
    todayCircle: {
        borderColor: COLORS.info,
    },
    dayLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    todayLabel: {
        color: COLORS.info,
    },
    symbol: {
        fontSize: 20,
        fontWeight: 'bold',
    }
});

export default WeeklyCheckinView; 