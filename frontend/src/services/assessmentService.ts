import api from "../api/api";

const LOCAL_ASSESSMENT_HISTORY_KEY =
  "campusconnect:assessment-history";

interface Metrics {
  technicalKnowledge: number;
  accuracy: number;
}

interface QuestionAnalysis {
  question?: string;
  candidateAnswer?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  solution?: string;
  topic?: string;
}

interface AssessmentRecord {
  id: string;

  company: string;

  role_name: string;

  difficulty: string;

  overallScore: number;

  correctAnswers: number;

  totalQuestions: number;

  metrics: Metrics;

  topicsCovered: string[];

  strengths: string[];

  weaknesses: string;

  feedback: string;

  questionsAnalysis: QuestionAnalysis[];

  createdAt: string;
}

interface ApiAssessmentRecord {
  id?: string;

  companyName?: string;

  roleName?: string;

  difficulty?: string;

  overallScore?: number;

  correctAnswers?: number;

  totalQuestions?: number;

  metricTechnical?: number;

  metricAccuracy?: number;

  topicsCovered?: string[];

  strengths?: string[];

  improvements?: string;

  feedback?: string;

  detailedAnalysis?: QuestionAnalysis[];

  createdAt?: string;
}

const toArray = <T>(
  value: T[] | unknown
): T[] =>
  Array.isArray(value) ? value : [];

const toNumber = (
  value: unknown,
  fallback = 0
): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const normalizeText = (
  value: unknown
): string =>
  String(value || "")
    .trim()
    .toLowerCase();

const toMinuteBucket = (
  value: unknown
): number => {
  const normalized =
    typeof value === "string" ||
    typeof value === "number" ||
    value instanceof Date
      ? value
      : 0;

  const time = new Date(normalized).getTime();

  return Number.isFinite(time)
    ? Math.floor(time / 60000)
    : 0;
};

const isLocalOnlyId = (
  id: unknown
): boolean =>
  String(id || "").startsWith("local-");

const buildAssessmentFingerprint = (
  record: Partial<AssessmentRecord> = {}
): string => {
  const company = normalizeText(
    record.company
  );

  const role = normalizeText(
    record.role_name
  );

  const difficulty = normalizeText(
    record.difficulty || "moderate"
  );

  const overall = toNumber(
    record.overallScore,
    0
  );

  const correct = toNumber(
    record.correctAnswers,
    0
  );

  const total = toNumber(
    record.totalQuestions,
    0
  );

  const minuteBucket =
    toMinuteBucket(record.createdAt);

  return `${company}|${role}|${difficulty}|${overall}|${correct}|${total}|${minuteBucket}`;
};

const choosePreferredRecord = (
  a: AssessmentRecord,
  b: AssessmentRecord
): AssessmentRecord => {
  const aLocal = isLocalOnlyId(a?.id);

  const bLocal = isLocalOnlyId(b?.id);

  if (aLocal !== bLocal) {
    return aLocal
      ? { ...a, ...b }
      : { ...b, ...a };
  }

  const aTime = new Date(
    a?.createdAt || 0
  ).getTime();

  const bTime = new Date(
    b?.createdAt || 0
  ).getTime();

  const aIsNewer =
    (Number.isFinite(aTime)
      ? aTime
      : 0) >=
    (Number.isFinite(bTime)
      ? bTime
      : 0);

  return aIsNewer
    ? { ...b, ...a }
    : { ...a, ...b };
};

export const mapAssessmentRecordToUi = (
  record: ApiAssessmentRecord
): AssessmentRecord => ({
  id: String(record.id || ""),

  company:
    record.companyName || "Practice",

  role_name:
    record.roleName || "SDE",

  difficulty:
    record.difficulty || "moderate",

  overallScore: toNumber(
    record.overallScore,
    0
  ),

  correctAnswers: toNumber(
    record.correctAnswers,
    0
  ),

  totalQuestions: toNumber(
    record.totalQuestions,
    0
  ),

  metrics: {
    technicalKnowledge: toNumber(
      record.metricTechnical,
      0
    ),

    accuracy: toNumber(
      record.metricAccuracy,
      0
    ),
  },

  topicsCovered: toArray<string>(
    record.topicsCovered
  ),

  strengths: toArray<string>(
    record.strengths
  ),

  weaknesses:
    record.improvements || "",

  feedback: record.feedback || "",

  questionsAnalysis:
    toArray<QuestionAnalysis>(
      record.detailedAnalysis
    ),

  createdAt:
    record.createdAt || "",
});

const getLocalHistory =
  (): AssessmentRecord[] => {
    try {
      const raw = localStorage.getItem(
        LOCAL_ASSESSMENT_HISTORY_KEY
      );

      const parsed = raw
        ? JSON.parse(raw)
        : [];

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  };

const setLocalHistory = (
  records: AssessmentRecord[]
): void => {
  try {
    localStorage.setItem(
      LOCAL_ASSESSMENT_HISTORY_KEY,
      JSON.stringify(
        Array.isArray(records)
          ? records
          : []
      )
    );
  } catch {
  }
};

const mergeAssessmentHistory = (
  incoming: AssessmentRecord[] = [],
  existing: AssessmentRecord[] = []
): AssessmentRecord[] => {
  const idMap = new Map<
    string,
    AssessmentRecord
  >();

  const upsert = (
    record: AssessmentRecord
  ): void => {
    if (
      !record ||
      typeof record !== "object"
    )
      return;

    const key = String(
      record.id ||
        `${record.company || "Practice"}-${
          record.role_name || "SDE"
        }-${
          record.createdAt ||
          Date.now()
        }`
    );

    if (!idMap.has(key)) {
      idMap.set(key, record);
      return;
    }

    idMap.set(key, {
      ...idMap.get(key)!,
      ...record,
    });
  };

  existing.forEach(upsert);

  incoming.forEach(upsert);

  const fingerprintMap = new Map<
    string,
    AssessmentRecord
  >();

  Array.from(idMap.values()).forEach(
    (record) => {
      const fingerprint =
        buildAssessmentFingerprint(
          record
        );

      if (
        !fingerprintMap.has(
          fingerprint
        )
      ) {
        fingerprintMap.set(
          fingerprint,
          record
        );

        return;
      }

      const selected =
        choosePreferredRecord(
          fingerprintMap.get(
            fingerprint
          )!,
          record
        );

      fingerprintMap.set(
        fingerprint,
        selected
      );
    }
  );

  return Array.from(
    fingerprintMap.values()
  ).sort(
    (a, b) =>
      new Date(
        b.createdAt || 0
      ).getTime() -
      new Date(
        a.createdAt || 0
      ).getTime()
  );
};

export const createAssessmentRecord =
  async (
    payload: any
  ): Promise<
    AssessmentRecord | unknown
  > => {
    const optimisticRecord: AssessmentRecord =
      {
        id: `local-${Date.now()}`,

        company:
          payload?.companyName ||
          "Practice",

        role_name:
          payload?.roleName || "SDE",

        difficulty:
          payload?.difficulty ||
          "moderate",

        overallScore: toNumber(
          payload?.overallScore,
          0
        ),

        correctAnswers: toNumber(
          payload?.correctAnswers,
          0
        ),

        totalQuestions: toNumber(
          payload?.totalQuestions,
          0
        ),

        metrics: {
          technicalKnowledge:
            toNumber(
              payload?.metrics
                ?.technicalKnowledge,
              0
            ),

          accuracy: toNumber(
            payload?.metrics
              ?.accuracy,
            0
          ),
        },

        topicsCovered:
          toArray<string>(
            payload?.topicsCovered
          ),

        strengths:
          toArray<string>(
            payload?.strengths
          ),

        weaknesses:
          payload?.improvements ||
          "",

        feedback:
          payload?.feedback || "",

        questionsAnalysis:
          toArray<QuestionAnalysis>(
            payload?.detailedAnalysis
          ),

        createdAt:
          new Date().toISOString(),
      };

    const currentLocal =
      getLocalHistory();

    setLocalHistory(
      mergeAssessmentHistory(
        [optimisticRecord],
        currentLocal
      )
    );

    try {
      const response =
        await api.post(
          "/assessments",
          payload
        );

      const saved =
        mapAssessmentRecordToUi(
          response.data || {}
        );

      const localWithoutOptimistic =
        getLocalHistory().filter(
          (record) =>
            String(record?.id) !==
            String(
              optimisticRecord.id
            )
        );

      const merged =
        mergeAssessmentHistory(
          [saved],
          localWithoutOptimistic
        );

      setLocalHistory(merged);

      return response.data;
    } catch (error) {
      return optimisticRecord;
    }
  };

export const getAssessmentHistory =
  async (): Promise<
    AssessmentRecord[]
  > => {
    const localHistory =
      getLocalHistory();

    try {
      const response =
        await api.get(
          "/assessments"
        );

      const remoteHistory =
        toArray<ApiAssessmentRecord>(
          response.data
        ).map(
          mapAssessmentRecordToUi
        );

      const merged =
        mergeAssessmentHistory(
          remoteHistory,
          localHistory
        );

      setLocalHistory(merged);

      return merged;
    } catch {
      return localHistory;
    }
  };