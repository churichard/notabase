import { Descendant } from 'slate';
import { NoteTreeItem } from 'lib/store';
import { PlanId, BillingFrequency } from 'constants/pricing';

type Tables = Database['public']['Tables'];

export type User = Tables['users']['Row'];
export type Note = Tables['notes']['Row'];
export type NoteInsert = Tables['notes']['Insert'];
export type Subscription = Tables['subscriptions']['Row'];
export type Site = Tables['sites']['Row'];

export enum SubscriptionStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum Visibility {
  Private = 'private',
  Public = 'public',
}

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          content: Descendant[];
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
          visibility: Visibility;
        };
        Insert: {
          content?: Descendant[];
          created_at?: string;
          id?: string;
          title: string;
          updated_at?: string;
          user_id: string;
          visibility?: Visibility;
        };
        Update: {
          content?: Descendant[];
          created_at?: string;
          id?: string;
          title?: string;
          updated_at?: string;
          user_id?: string;
          visibility?: Visibility;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean;
          current_period_end: string;
          frequency: Database['public']['Enums']['billing_frequency'];
          id: string;
          plan_id: Database['public']['Enums']['plan_id'];
          stripe_customer_id: string;
          stripe_subscription_id: string | null;
          subscription_status: Database['public']['Enums']['subscription_status'];
          user_id: string | null;
        };
        Insert: {
          cancel_at_period_end?: boolean;
          current_period_end: string;
          frequency?: Database['public']['Enums']['billing_frequency'];
          id?: string;
          plan_id: Database['public']['Enums']['plan_id'];
          stripe_customer_id: string;
          stripe_subscription_id?: string | null;
          subscription_status: Database['public']['Enums']['subscription_status'];
          user_id?: string | null;
        };
        Update: {
          cancel_at_period_end?: boolean;
          current_period_end?: string;
          frequency?: Database['public']['Enums']['billing_frequency'];
          id?: string;
          plan_id?: Database['public']['Enums']['plan_id'];
          stripe_customer_id?: string;
          stripe_subscription_id?: string | null;
          subscription_status?: Database['public']['Enums']['subscription_status'];
          user_id?: string | null;
        };
        Relationships: [];
      };
      sites: {
        Row: {
          id: string;
          user_id: string;
          is_active: boolean;
        };
        Insert: {
          id: string;
          user_id: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          note_tree: NoteTreeItem[] | null;
          subscription_id: string | null;
        };
        Insert: {
          id: string;
          note_tree?: NoteTreeItem[] | null;
          subscription_id?: string | null;
        };
        Update: {
          id?: string;
          note_tree?: NoteTreeItem[] | null;
          subscription_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      citext:
        | {
            Args: { '': string };
            Returns: unknown;
          }
        | {
            Args: { '': boolean };
            Returns: unknown;
          }
        | {
            Args: { '': unknown };
            Returns: unknown;
          };
      citext_hash: {
        Args: { '': unknown };
        Returns: number;
      };
      citextin: {
        Args: { '': unknown };
        Returns: unknown;
      };
      citextout: {
        Args: { '': unknown };
        Returns: unknown;
      };
      citextrecv: {
        Args: { '': unknown };
        Returns: unknown;
      };
      citextsend: {
        Args: { '': unknown };
        Returns: string;
      };
      uuid_generate_v1: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uuid_generate_v1mc: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uuid_generate_v3: {
        Args: { namespace: string; name: string };
        Returns: string;
      };
      uuid_generate_v4: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uuid_generate_v5: {
        Args: { name: string; namespace: string };
        Returns: string;
      };
      uuid_nil: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uuid_ns_dns: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uuid_ns_oid: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uuid_ns_url: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      uuid_ns_x500: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      billing_frequency: BillingFrequency;
      plan_id: PlanId;
      subscription_status: SubscriptionStatus;
    };
  };
}
