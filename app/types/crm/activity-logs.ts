// The audited domain events the API records for a subject.
export type ActivityLogEvent = "created" | "updated" | "deleted";

// The member/user who triggered the change. Null for system-originated events.
export interface ActivityLogCauser {
  id: number;
  name: string;
  email: string;
}

// Before/after snapshots of the affected attributes. `attributes` holds the new
// values, `old` the previous ones; either may be absent (e.g. a create has no
// `old`, a delete has no `attributes`).
export interface ActivityLogChanges {
  attributes?: Record<string, unknown>;
  old?: Record<string, unknown>;
}

export interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  event: ActivityLogEvent;
  subject_type: string;
  subject_id: string;
  causer: ActivityLogCauser | null;
  // An empty array when nothing was captured (Laravel serialises `{}` as `[]`).
  changes: ActivityLogChanges | never[];
  created_at: string;
}
