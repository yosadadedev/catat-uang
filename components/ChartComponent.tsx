import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Category } from '../database/database';
import { useTheme } from '../contexts/ThemeContext';
import { useLocalization } from '../contexts/LocalizationContext';

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface PieChartProps {
  data: ChartData[];
  size?: number;
  showLegend?: boolean;
}

// Simple SVG-like Pie Chart using View components
export const PieChart: React.FC<PieChartProps> = ({ data, size = 200, showLegend = true }) => {
  const { colors } = useTheme();
  const { t } = useLocalization();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', height: size }}>
        <Ionicons name="pie-chart-outline" size={64} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>{t('noData')}</Text>
      </View>
    );
  }

  // Create pie segments using border radius trick
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    return {
      ...item,
      percentage,
      startAngle: data.slice(0, index).reduce((sum, prev) => sum + (prev.value / total) * 360, 0),
      endAngle: data.slice(0, index + 1).reduce((sum, prev) => sum + (prev.value / total) * 360, 0),
    };
  });

  return (
    <View className="items-center">
      {/* Pie Chart */}
      <View className="relative" style={{ width: size, height: size }}>
        <View
          className="overflow-hidden rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: '#F3F4F6',
          }}>
          {/* Simple representation using colored segments */}
          {segments.map((segment, index) => {
            const isLargest = segment.percentage > 25;
            return (
              <View
                key={index}
                className="absolute"
                style={{
                  width: size / 2,
                  height: size / 2,
                  backgroundColor: segment.color,
                  borderRadius: size / 4,
                  top: index % 2 === 0 ? 0 : size / 2,
                  left: index < 2 ? 0 : size / 2,
                  opacity: isLargest ? 1 : 0.8,
                }}
              />
            );
          })}
        </View>

        {/* Center circle */}
        <View
          style={{
            position: 'absolute',
            backgroundColor: colors.surface,
            borderRadius: size * 0.3,
            alignItems: 'center',
            justifyContent: 'center',
            width: size * 0.6,
            height: size * 0.6,
            top: size * 0.2,
            left: size * 0.2,
          }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
            {data.length}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>{t('categories')}</Text>
        </View>
      </View>

      {/* Legend */}
      {showLegend && (
        <View style={{ marginTop: 24, width: '100%' }}>
          {data.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 8,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    marginRight: 12,
                    backgroundColor: item.color,
                  }}
                />
                <Text style={{ color: colors.text, fontWeight: '500', flex: 1 }} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(item.value)}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  {item.percentage.toFixed(1)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: ChartData[];
  height?: number;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({ data, height = 200, showValues = true }) => {
  const { colors } = useTheme();
  const { t } = useLocalization();
  const maxValue = Math.max(...data.map((item) => item.value));

  if (maxValue === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', height }}>
        <Ionicons name="bar-chart-outline" size={64} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary, marginTop: 8 }}>{t('noData')}</Text>
      </View>
    );
  }

  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height,
        }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 40); // 40px for labels
          return (
            <View key={index} style={{ alignItems: 'center', flex: 1, marginHorizontal: 4 }}>
              {/* Value label */}
              {showValues && item.value > 0 && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginBottom: 4,
                    fontWeight: '500',
                  }}>
                  {new Intl.NumberFormat('id-ID', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(item.value)}
                </Text>
              )}

              {/* Bar */}
              <View
                style={{
                  width: '100%',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  height: Math.max(barHeight, 4), // Minimum height of 4px
                  backgroundColor: item.color,
                  minHeight: item.value > 0 ? 8 : 4,
                }}
              />

              {/* Category label */}
              <Text
                style={{
                  fontSize: 12,
                  color: colors.text,
                  marginTop: 8,
                  textAlign: 'center',
                  fontWeight: '500',
                }}
                numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// Utility function to prepare chart data from transactions
export const prepareChartData = (
  transactions: Transaction[],
  categories: Category[],
  type?: 'income' | 'expense'
): ChartData[] => {
  const filteredTransactions = type ? transactions.filter((t) => t.type === type) : transactions;

  const categoryTotals = new Map<number, number>();

  filteredTransactions.forEach((transaction) => {
    const current = categoryTotals.get(transaction.category_id) || 0;
    categoryTotals.set(transaction.category_id, current + Math.abs(transaction.amount));
  });

  const chartData: ChartData[] = [];
  const total = Array.from(categoryTotals.values()).reduce((sum, value) => sum + value, 0);

  categoryTotals.forEach((value, categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category && value > 0) {
      chartData.push({
        label: category.name,
        value,
        color: category.color,
        percentage: (value / total) * 100,
      });
    }
  });

  return chartData.sort((a, b) => b.value - a.value);
};

// Monthly spending trend component
interface MonthlyTrendProps {
  transactions: Transaction[];
  months?: number;
}

export const MonthlyTrend: React.FC<MonthlyTrendProps> = ({ transactions, months = 6 }) => {
  const monthlyData = React.useMemo(() => {
    const data: ChartData[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getFullYear() === date.getFullYear() &&
          t.type === 'expense'
        );
      });

      const total = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      data.push({
        label: date.toLocaleDateString('id-ID', { month: 'short' }),
        value: total,
        color: '#EF4444',
        percentage: 0, // Will be calculated if needed
      });
    }

    return data;
  }, [transactions, months]);

  return (
    <View className="rounded-xl bg-white p-4">
      <Text className="mb-4 text-lg font-bold text-gray-900">
        Tren Pengeluaran {months} Bulan Terakhir
      </Text>
      <BarChart data={monthlyData} height={150} />
    </View>
  );
};
