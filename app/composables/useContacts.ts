import { DUMMY_CONTACTS, type Contact } from "~/constants/dummy/contacts";

// Shared, session-persistent contacts list seeded from the dummy data.
// New contacts created on the fly are prepended so they're immediately
// selectable anywhere `useContacts()` is consumed.
export function useContacts() {
  const contacts = useState<Contact[]>("contacts", () => [...DUMMY_CONTACTS]);

  function addContact(input: Partial<Contact>): Contact {
    const today = new Date().toISOString().slice(0, 10);
    const contact: Contact = {
      id: crypto.randomUUID(),
      name: input.name ?? "",
      mobile_num: input.mobile_num ?? "",
      email: input.email ?? "",
      gender: input.gender ?? "Male",
      age: input.age ?? 0,
      current_state: input.current_state ?? "Active",
      last_active_lead: "",
      last_activity_date: today,
      date_created: today,
    };
    contacts.value = [contact, ...contacts.value];
    return contact;
  }

  return { contacts, addContact };
}
