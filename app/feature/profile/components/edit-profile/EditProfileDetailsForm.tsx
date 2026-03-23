"use client";

import type { BaseSyntheticEvent } from "react";
import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProfileDetailsFormValues } from "@/app/feature/profile/types/edit-profile.forms";

type EditProfileDetailsFormProps = {
  isSaving: boolean;
  isDetailsSubmitting: boolean;
  hasDetailsChanges: boolean;
  detailsSubmitError: string;
  detailBio: string;
  genderOptions: readonly string[];
  detailsControl: Control<ProfileDetailsFormValues>;
  registerDetails: UseFormRegister<ProfileDetailsFormValues>;
  onSubmitDetails: (event?: BaseSyntheticEvent) => Promise<void>;
};

export default function EditProfileDetailsForm({
  isSaving,
  isDetailsSubmitting,
  hasDetailsChanges,
  detailsSubmitError,
  detailBio,
  genderOptions,
  detailsControl,
  registerDetails,
  onSubmitDetails,
}: EditProfileDetailsFormProps) {
  return (
    <form
      className="space-y-4 rounded-md p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmitDetails(event);
      }}
    >
      <h2 className="text-lg font-semibold text-foreground">Profile details</h2>

      <div>
        <label className="block text-md font-semibold">Bio</label>
        <textarea
          className="ui-input mt-2 min-h-24 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
          disabled={isDetailsSubmitting}
          placeholder="Tell people about yourself..."
          {...registerDetails("bio", {
            maxLength: 500,
          })}
        />
        <p className="mt-1 text-xs">{detailBio.trim().length}/500</p>
      </div>

      <div>
        <label className="block text-md font-semibold">Full name</label>
        <input
          className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
          disabled={isDetailsSubmitting}
          placeholder="Your name"
          type="text"
          {...registerDetails("name", {
            validate: (value) => value.trim().length > 0,
          })}
        />
      </div>

      <div>
        <label className="block text-md font-semibold">Email</label>
        <input
          className="ui-input mt-2 w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors"
          disabled={isDetailsSubmitting}
          placeholder="you@example.com"
          readOnly
          type="email"
          {...registerDetails("email", {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          })}
        />
      </div>

      <div>
        <label className="block text-md font-semibold">Gender</label>
        <Controller
          control={detailsControl}
          name="gender"
          rules={{
            validate: (value) => (value ?? "").trim().length > 0,
          }}
          render={({ field }) => (
            <Select
              disabled={isDetailsSubmitting}
              onValueChange={(value) => field.onChange((value ?? "").toUpperCase())}
              value={field.value || undefined}
            >
              <SelectTrigger className="mt-2 w-[180px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {detailsSubmitError ? (
        <p className="text-base text-red-600">{detailsSubmitError}</p>
      ) : null}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          className="ui-btn-primary rounded-full px-5 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
          disabled={isSaving || isDetailsSubmitting || !hasDetailsChanges}
          type="submit"
        >
          {isSaving ? "Updating..." : "Update profile"}
        </button>
      </div>
    </form>
  );
}

