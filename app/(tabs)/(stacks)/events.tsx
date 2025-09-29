import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, MapPin, Search, Tag } from 'lucide-react-native';

import Header from '@/components/shared/Header';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, FONTS, SPACING } from '@/utils/constants';
import { formatDate, withAlpha } from '@/utils/helpers';

const API_BASE_URL = 'http://194.238.23.60:5007';
const PAGE_SIZE_OPTIONS = [5, 10, 20];

type EventItem = {
  event_id: number;
  title: string;
  description?: string | null;
  event_date: string;
  event_end_date?: string | null;
  location?: string | null;
  category?: string | null;
  status?: string | null;
  Class?: {
    class_id: number;
    class_name: string;
    academic_year?: string;
  } | null;
};

type EventsApiResponse = {
  events: EventItem[];
  total?: number;
};

type LocalSearchParams = {
  classId?: string | string[];
};

export default function EventsScreen() {
  const { authState } = useAuth();
  const params = useLocalSearchParams<LocalSearchParams>();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includePast, setIncludePast] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalEvents, setTotalEvents] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const classId = useMemo(() => {
    const rawValue = Array.isArray(params.classId) ? params.classId[0] : params.classId;
    if (!rawValue) {
      return null;
    }

    const parsed = Number.parseInt(rawValue, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }, [params.classId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [includePast, debouncedSearch, limit]);

  const fetchEvents = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!authState.user?.token) {
        return;
      }

      const isSilent = options?.silent ?? false;

      if (isSilent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const query = new URLSearchParams();
        query.append('page', page.toString());
        query.append('limit', limit.toString());
        query.append('includePast', includePast ? 'true' : 'false');

        if (debouncedSearch) {
          query.append('search', debouncedSearch);
        }

        if (classId) {
          query.append('class_id', classId.toString());
        }

        const response = await fetch(`${API_BASE_URL}/api/events?${query.toString()}`, {
          headers: {
            Authorization: `Bearer ${authState.user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load events (${response.status})`);
        }

        const data: EventsApiResponse = await response.json();
        const fetchedEvents = data.events ?? [];

        setEvents(fetchedEvents);
        setTotalEvents(
          Number.isFinite(Number(data.total))
            ? Number(data.total)
            : (page - 1) * limit + fetchedEvents.length,
        );
        setHasNextPage(
          fetchedEvents.length === limit && (data.total ? page * limit < data.total : true),
        );
      } catch (fetchError) {
        console.error('Failed to fetch events list:', fetchError);
        setEvents([]);
        setTotalEvents(0);
        setHasNextPage(false);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Something went wrong while loading events.',
        );
      } finally {
        if (isSilent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [authState.user?.token, classId, debouncedSearch, includePast, limit, page],
  );

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = useCallback(() => {
    if (loading) {
      return;
    }

    fetchEvents({ silent: true });
  }, [fetchEvents, loading]);

  const handlePrevPage = () => {
    setPage(current => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage(current => current + 1);
    }
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
  };

  const totalPages = useMemo(() => {
    if (totalEvents > 0) {
      return Math.max(1, Math.ceil(totalEvents / limit));
    }

    return hasNextPage ? page + 1 : page;
  }, [hasNextPage, limit, page, totalEvents]);

  const startIndex = events.length > 0 ? (page - 1) * limit + 1 : 0;
  const endIndex = (page - 1) * limit + events.length;
  const totalLabel = totalEvents > 0 ? totalEvents : endIndex;

  const renderEvent = ({ item }: { item: EventItem }) => {
    const eventDates =
      item.event_end_date && item.event_end_date !== item.event_date
        ? `${formatDate(item.event_date)} - ${formatDate(item.event_end_date)}`
        : formatDate(item.event_date);

    const metadata: string[] = [eventDates];

    if (item.Class?.class_name) {
      metadata.push(item.Class.class_name);
    }

    if (item.location) {
      metadata.push(item.location);
    }

    return (
      <Card key={item.event_id} padding="large" style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventIconWrapper}>
            <Calendar size={18} color={COLORS.primary[500]} />
          </View>
          <View style={styles.eventTitleGroup}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventMeta}>{metadata.join(' · ')}</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.eventDescription}>{item.description}</Text>
        ) : null}

        <View style={styles.eventFooter}>
          {item.category ? (
            <View style={styles.eventTag}>
              <Tag size={14} color={COLORS.primary[500]} />
              <Text style={styles.eventTagLabel}>{item.category}</Text>
            </View>
          ) : null}
          {item.location ? (
            <View style={styles.eventTag}>
              <MapPin size={14} color={COLORS.gray[500]} />
              <Text style={styles.eventTagLabel}>{item.location}</Text>
            </View>
          ) : null}
        </View>
      </Card>
    );
  };

  const listEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={COLORS.primary[500]} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.errorTitle}>Unable to load events</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchEvents()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>No events found</Text>
        <Text style={styles.emptySubtitle}>Try adjusting your filters or search.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Events" showBackButton />
      <SafeAreaView style={styles.content} edges={['left', 'right', 'bottom']}>
        <View style={styles.filtersContainer}>
          <Card padding="large" style={styles.filterCard}>
            <Text style={styles.filterTitle}>Filter events</Text>

            <View style={styles.searchRow}>
              <View style={styles.searchInputWrapper}>
                <Search size={16} color={COLORS.gray[400]} style={styles.searchIcon} />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search by title or description"
                  placeholderTextColor={COLORS.gray[400]}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
              </View>
              {searchTerm.length > 0 && (
                <TouchableOpacity style={styles.clearButton} onPress={() => setSearchTerm('')}>
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Include past events</Text>
              <Switch
                value={includePast}
                onValueChange={setIncludePast}
                trackColor={{ false: COLORS.gray[200], true: withAlpha(COLORS.primary[500], 0.3) }}
                thumbColor={includePast ? COLORS.primary[500] : '#FFFFFF'}
              />
            </View>

            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Results per page</Text>
              <View style={styles.limitChips}>
                {PAGE_SIZE_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleLimitChange(option)}
                    style={[
                      styles.limitChip,
                      limit === option && { backgroundColor: withAlpha(COLORS.primary[500], 0.12) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.limitChipLabel,
                        limit === option && { color: COLORS.primary[600] },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {startIndex === 0
              ? 'No events to display'
              : `Showing ${startIndex}–${endIndex} of ${Math.max(totalLabel, endIndex)} events`}
          </Text>
          <Text style={styles.pageIndicator}>
            Page {page} of {totalPages}
          </Text>
        </View>

        <FlatList
          data={events}
          keyExtractor={item => item.event_id.toString()}
          renderItem={renderEvent}
          contentContainerStyle={events.length === 0 ? styles.listEmptyContainer : styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary[500]}
              colors={[COLORS.primary[500]]}
            />
          }
          ListEmptyComponent={listEmptyComponent}
        />

        <View style={styles.paginationBar}>
          <TouchableOpacity
            style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
            onPress={handlePrevPage}
            disabled={page === 1}
          >
            <Text style={[styles.paginationButtonText, page === 1 && styles.paginationButtonTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paginationButton, !hasNextPage && styles.paginationButtonDisabled]}
            onPress={handleNextPage}
            disabled={!hasNextPage}
          >
            <Text
              style={[styles.paginationButtonText, !hasNextPage && styles.paginationButtonTextDisabled]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  filtersContainer: {
    marginTop: SPACING.lg,
  },
  filterCard: {
    gap: SPACING.lg,
  },
  filterTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[900],
    paddingVertical: SPACING.sm,
  },
  clearButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    backgroundColor: withAlpha(COLORS.primary[500], 0.08),
  },
  clearButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.primary[600],
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[700],
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  limitLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.gray[700],
  },
  limitChips: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  limitChip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
  },
  limitChipLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  summaryRow: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  pageIndicator: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.gray[700],
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  listEmptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
  },
  listSeparator: {
    height: SPACING.md,
  },
  eventCard: {
    gap: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  eventIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: withAlpha(COLORS.primary[500], 0.12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitleGroup: {
    flex: 1,
    gap: SPACING.xs,
  },
  eventTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.gray[900],
  },
  eventMeta: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.gray[600],
  },
  eventDescription: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray[700],
  },
  eventFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  eventTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 999,
    backgroundColor: withAlpha(COLORS.gray[500], 0.08),
  },
  eventTagLabel: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.gray[600],
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.gray[800],
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  errorTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.error[600],
  },
  errorSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  retryButton: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 999,
    backgroundColor: COLORS.primary[500],
  },
  retryButtonText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  paginationButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.primary[500],
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: COLORS.gray[200],
  },
  paginationButtonText: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  paginationButtonTextDisabled: {
    color: COLORS.gray[500],
  },
});
