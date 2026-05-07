import { create } from "zustand";

interface Interview {
  id?: string | number;

  persistedRecordId?: string;

  company?: string;

  timestamp?: string;

  analysis?: any;

  metadata?: {
    localInterviewId?: string;
    [key: string]: any;
  };

  [key: string]: any;
}

interface InterviewStore {
  isInCall: boolean;

  activeSession: any | null;

  interviewHistory: Interview[];

  setIsInCall: (
    inCall: boolean
  ) => void;

  setActiveSession: (
    session: any
  ) => void;

  clearActiveSession: () => void;

  setInterviewHistory: (
    interviews: Interview[]
  ) => void;

  mergeInterviewHistory: (
    incomingInterviews: Interview[]
  ) => void;

  addToHistory: (
    interview: Interview
  ) => void;

  updateHistoryInterview: (
    id: string | number,
    updates: Partial<Interview>
  ) => void;
}

export const useInterviewStore =
  create<InterviewStore>(
    (set) => ({
      isInCall: false,

      activeSession: null,

      interviewHistory: [],

      setIsInCall: (
        inCall: boolean
      ): void =>
        set({
          isInCall: inCall,
        }),

      setActiveSession: (
        session: any
      ): void =>
        set({
          activeSession: session,
        }),

      clearActiveSession: (): void =>
        set({
          activeSession: null,
        }),

      setInterviewHistory: (
        interviews: Interview[]
      ): void =>
        set({
          interviewHistory:
            Array.isArray(interviews)
              ? interviews
              : [],
        }),

      mergeInterviewHistory: (
        incomingInterviews: Interview[]
      ): void =>
        set((state) => {
          const incoming =
            Array.isArray(
              incomingInterviews
            )
              ? incomingInterviews
              : [];

          const mergedByKey =
            new Map<
              string,
              Interview
            >();

          const getInterviewKey = (
            interview: Interview
          ): string | null => {
            if (
              !interview ||
              typeof interview !==
                "object"
            )
              return null;

            return String(
              interview.persistedRecordId ||
                interview.metadata
                  ?.localInterviewId ||
                interview.id ||
                `${
                  interview.company ||
                  "unknown"
                }-${
                  interview.timestamp ||
                  Date.now()
                }`
            );
          };

          const upsert = (
            interview: Interview
          ): void => {
            const key =
              getInterviewKey(
                interview
              );

            if (!key) return;

            if (
              !mergedByKey.has(key)
            ) {
              mergedByKey.set(
                key,
                interview
              );

              return;
            }

            const existing =
              mergedByKey.get(
                key
              );

            mergedByKey.set(key, {
              ...existing,
              ...interview,

              analysis:
                interview.analysis ??
                existing?.analysis,
            });
          };

          state.interviewHistory.forEach(
            upsert
          );

          incoming.forEach(upsert);

          const merged =
            Array.from(
              mergedByKey.values()
            ).sort(
              (a, b) =>
                new Date(
                  b.timestamp || 0
                ).getTime() -
                new Date(
                  a.timestamp || 0
                ).getTime()
            );

          return {
            interviewHistory:
              merged,
          };
        }),

      addToHistory: (
        interview: Interview
      ): void =>
        set((state) => ({
          interviewHistory: [
            interview,
            ...state.interviewHistory,
          ],
        })),

      updateHistoryInterview: (
        id: string | number,
        updates: Partial<Interview>
      ): void =>
        set((state) => ({
          interviewHistory:
            state.interviewHistory.map(
              (interview) =>
                String(
                  interview.id
                ) === String(id)
                  ? {
                      ...interview,
                      ...updates,
                    }
                  : interview
            ),
        })),
    })
  );