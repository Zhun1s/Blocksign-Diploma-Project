import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TasksByProjectSection } from "../../components/taskrow";

type Task = {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  important?: boolean;
  projectId: string;
};
type Project = { id: string; name: string };

const mockProjects: Project[] = [
  { id: "p1", name: "My App" },
  { id: "p2", name: "University" },
  { id: "p3", name: "Tleu Agency" },
];

const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Make design",
    description: "No description",
    projectId: "p1",
    deadline: "Today",
    important: true,
  },
  {
    id: "t2",
    title: "Home layout",
    description: "No description",
    projectId: "p1",
    deadline: "Today",
  },
  {
    id: "t3",
    title: "Write report",
    description: "No description",
    projectId: "p2",
    deadline: "Today",
  },
  {
    id: "t4",
    title: "Write report",
    description: "No description",
    projectId: "p3",
    deadline: "Today",
  },
];

function buildSections(tasks: Task[], projects: Project[]) {
  const namedById = Object.fromEntries(projects.map((p) => [p.id, p.name]));
  const grouped: Record<string, Task[]> = {};

  for (const t of tasks) (grouped[t.projectId] ??= []).push(t);

  return Object.entries(grouped).map(([projectId, projectTasks]) => ({
    title: namedById[projectId] ?? "Unknown Project",
    data: projectTasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      deadline: t.deadline,
      important: t.important,
    })),
  }));
}

function startOfWeekMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function WeekItem({
  item,
  isSelected,
  onPress,
}: {
  item: { dayLabel: string; dayNumber: number };
  isSelected: boolean;
  onPress: () => void;
}) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isSelected ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isSelected, anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[
          styles.weekItem,
          { transform: [{ scale }] },
          isSelected && styles.weekItemSelectedBorder,
        ]}
      >
        <Text
          style={[
            styles.weekItemDate,
            isSelected && styles.weekItemTextSelected,
          ]}
        >
          {item.dayNumber}
        </Text>

        <Text
          style={[
            styles.weekItemDay,
            isSelected && styles.weekItemTextSelected,
            isSelected && styles.weekItemTextDaySelected,
          ]}
        >
          {item.dayLabel}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function Tab() {
  const now = useMemo(() => new Date(), []);

  const day = now.toLocaleDateString("en-US", { weekday: "short" });
  const monthYear = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const [selectedDate, setSelectedDate] = useState(now);

  const weekDays = useMemo(() => {
    const monday = startOfWeekMonday(now);
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(monday, i);
      return {
        key: date.toISOString().slice(0, 10),
        date,
        dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: date.getDate(),
      };
    });
  }, [now]);

  const [sections, setSections] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      setSections(buildSections(mockTasks, mockProjects));
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.textDay}>{day}</Text>
          <Text style={styles.textMonth}>{monthYear}</Text>
        </View>
        <View>
          <FlatList
            data={weekDays}
            horizontal
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.weekRow}
            renderItem={({ item }) => {
              const isSelected =
                item.date.toDateString() === selectedDate.toDateString();

              return (
                <WeekItem
                  item={item}
                  isSelected={isSelected}
                  onPress={() => setSelectedDate(item.date)}
                />
              );
            }}
          />
        </View>
        <TasksByProjectSection
          sections={sections}
          onRefresh={load}
          onTaskPress={(task: { id: any }) => console.log("open", task.id)}
          setError={setError}
          setLoading={setLoading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },

  container: {
    fontFamily: "Inter",
    flex: 1,
    marginTop: 56,
    display: "flex",
    flexDirection: "column",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "auto",
    marginHorizontal: 16,
  },

  textDay: {
    fontSize: 40,
    fontWeight: "bold",
  },

  textMonth: {
    fontSize: 24,
    fontWeight: "600",
    color: "#666666",
  },

  weekRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    gap: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 1, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  weekItem: {
    width: "auto",
    borderRadius: 8,
    alignItems: "center",
  },

  weekItemSelectedBorder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#909090",
    borderStyle: "solid",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },

  weekItemSelected: {
    borderBlockColor: "#0000",
  },

  weekItemDay: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
    textTransform: "uppercase",
  },

  weekItemDate: {
    fontSize: 20,
    fontWeight: "700",
    color: "#757575",
  },

  weekItemTextSelected: {
    color: "#000000",
  },

  weekItemTextDaySelected: {
    color: "#EE0000",
  },
});
