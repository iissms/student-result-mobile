import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { mockPerformanceTrends, mockResults, subjectPerformance } from '@/utils/mockData';
import { ChevronRight } from 'lucide-react-native';
import Header from '@/components/shared/Header';
import Card from '@/components/ui/Card';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import SubjectPerformance from '@/components/dashboard/SubjectPerformance';

const ANALYSIS_TABS = ['Overview', 'Subjects', 'Comparison'];

export default function AnalysisScreen() {
  const [activeTab, setActiveTab] = useState('Overview');
  
  const renderTabButtons = () => {
    return (
      <View style={styles.tabsContainer}>
        {ANALYSIS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === tab && styles.activeTabButtonText
            ]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  const renderOverviewTab = () => {
    // Get the highest and lowest grades
    const allSubjectResults = mockResults.flatMap(r => r.subjects);
    const highestSubject = allSubjectResults.reduce((prev, current) => 
      prev.percentage > current.percentage ? prev : current
    );
    const lowestSubject = allSubjectResults.reduce((prev, current) => 
      prev.percentage < current.percentage ? prev : current
    );
    
    return (
      <View style={styles.tabContent}>
        <PerformanceChart data={mockPerformanceTrends} />
        
        <Card style={styles.insightCard}>
          <Text style={styles.insightTitle}>Performance Insights</Text>
          
          <View style={styles.insight}>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Strongest Subject</Text>
              <Text style={styles.insightValue}>{highestSubject.subjectName}</Text>
              <Text style={[styles.insightMetric, styles.positiveMetric]}>
                {highestSubject.percentage}% (Grade {highestSubject.grade})
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Area for Improvement</Text>
              <Text style={styles.insightValue}>{lowestSubject.subjectName}</Text>
              <Text style={[styles.insightMetric, styles.negativeMetric]}>
                {lowestSubject.percentage}% (Grade {lowestSubject.grade})
              </Text>
            </View>
          </View>
          
          <View style={styles.insightSummary}>
            <Text style={styles.summaryText}>
              Your performance shows consistent progress over time with strengths in {highestSubject.subjectName}.
              Focus on improving {lowestSubject.subjectName} to raise your overall average.
            </Text>
          </View>
        </Card>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Detailed Analysis</Text>
          <ChevronRight size={20} color={COLORS.primary[500]} />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderSubjectsTab = () => {
    return (
      <View style={styles.tabContent}>
        <SubjectPerformance data={subjectPerformance} />
        
        <Card style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>Improvement Recommendations</Text>
          
          <View style={styles.recommendationItem}>
            <Text style={styles.subjectName}>History</Text>
            <Text style={styles.recommendationText}>
              Practice with past papers and focus on memorizing key dates and events. 
              Schedule a tutoring session for difficult topics.
            </Text>
          </View>
          
          <View style={styles.recommendationItem}>
            <Text style={styles.subjectName}>Computer Science</Text>
            <Text style={styles.recommendationText}>
              Work on practical coding exercises to reinforce theoretical concepts.
              Join a study group to collaborate on programming assignments.
            </Text>
          </View>
        </Card>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Subject Details</Text>
          <ChevronRight size={20} color={COLORS.primary[500]} />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderComparisonTab = () => {
    return (
      <View style={styles.tabContent}>
        <Card style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Class Ranking</Text>
          
          <View style={styles.rankRow}>
            <View style={styles.rankCircle}>
              <Text style={styles.rankNumber}>3</Text>
            </View>
            <View style={styles.rankInfo}>
              <Text style={styles.rankTitle}>Your Current Rank</Text>
              <Text style={styles.rankDescription}>Top 10% of class</Text>
            </View>
          </View>
          
          <View style={styles.comparisonStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Your Average</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>78%</Text>
              <Text style={styles.statLabel}>Class Average</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>92%</Text>
              <Text style={styles.statLabel}>Top Score</Text>
            </View>
          </View>
        </Card>
        
        <Card style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>Subject Rankings</Text>
          
          {['Mathematics', 'Science', 'English', 'History', 'Computer Science'].map((subject, index) => (
            <View key={subject} style={styles.subjectRankRow}>
              <Text style={styles.subjectRankName}>{subject}</Text>
              <View style={styles.subjectRankRight}>
                <View style={[
                  styles.rankIndicator, 
                  getRankStyle(index)
                ]}>
                  <Text style={styles.rankIndicatorText}>
                    #{index + 1}
                  </Text>
                </View>
                <ChevronRight size={16} color={COLORS.gray[400]} />
              </View>
            </View>
          ))}
        </Card>
      </View>
    );
  };
  
  const renderActiveTabContent = () => {
    switch(activeTab) {
      case 'Overview':
        return renderOverviewTab();
      case 'Subjects':
        return renderSubjectsTab();
      case 'Comparison':
        return renderComparisonTab();
      default:
        return renderOverviewTab();
    }
  };
  
  return (
    <View style={styles.container}>
      <Header title="Performance Analysis" showSettings />
      
      {renderTabButtons()}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderActiveTabContent()}
      </ScrollView>
    </View>
  );
}

const getRankStyle = (index: number) => {
  if (index === 0) return styles.topRank;
  if (index < 3) return styles.highRank;
  if (index < 5) return styles.midRank;
  return styles.lowRank;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    position: 'relative',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[600],
  },
  activeTabButtonText: {
    color: COLORS.primary[500],
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: COLORS.primary[500],
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  tabContent: {
    flex: 1,
  },
  insightCard: {
    marginVertical: SPACING.md,
  },
  insightTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  insight: {
    flexDirection: 'row',
  },
  insightItem: {
    flex: 1,
  },
  insightLabel: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
  },
  insightValue: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  insightMetric: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  positiveMetric: {
    color: COLORS.accent[500],
  },
  negativeMetric: {
    color: COLORS.error[500],
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.gray[200],
    marginHorizontal: SPACING.md,
  },
  insightSummary: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  summaryText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[800],
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary[50],
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  actionButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.primary[500],
    marginRight: SPACING.xs,
  },
  recommendationCard: {
    marginVertical: SPACING.md,
  },
  recommendationTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  recommendationItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  subjectName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  recommendationText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[800],
    lineHeight: 20,
  },
  comparisonCard: {
    marginVertical: SPACING.md,
  },
  comparisonTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  rankCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankNumber: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#FFFFFF',
  },
  rankInfo: {
    flex: 1,
  },
  rankTitle: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  rankDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
  },
  comparisonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.gray[900],
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray[600],
  },
  subjectRankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  subjectRankName: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.gray[800],
  },
  subjectRankRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankIndicator: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: SPACING.xs,
    marginRight: SPACING.xs,
  },
  rankIndicatorText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  topRank: {
    backgroundColor: COLORS.accent[500],
  },
  highRank: {
    backgroundColor: COLORS.primary[500],
  },
  midRank: {
    backgroundColor: COLORS.warning[500],
  },
  lowRank: {
    backgroundColor: COLORS.error[500],
  },
});