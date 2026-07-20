"use client";

import { Camera, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { Url } from "@hugeicons/core-free-icons";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeAvatarSchema } from "@/Schemas/user.schema";
import * as z from "zod"
import api from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";
import ApiResponse from "@/types/ApiResponse";
import { updateUserDetails } from "@/store/authSlice";
import { User } from "@/types/enums/user.enum";
import { ProfileSettingsSkeleton } from "../skeletons/profile-settings-skeleton";

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ProfileData {
  name: string;
  email: string;
  avatar?: string;
}

export interface SettingsProfileProps {
  profile?: User;
  onSave?: (data: ProfileData) => Promise<void>;
  onEmailChange?: (newEmail: string, currentPassword: string) => Promise<void>;
  onAvatarUpload?: (file: File) => Promise<string>;
  onAvatarRemove?: () => Promise<void>;
  className?: string;
  showEmailVerification?: boolean;
}

export default function SettingsProfile({

  onSave,
  onEmailChange,
  onAvatarUpload,
  onAvatarRemove,
  className,
  showEmailVerification = true,
}: SettingsProfileProps) {

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);
  const profileUser = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()


  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (profileUser?.avatar?.url) {
      setAvatarPreview(profileUser?.avatar.url);
    }
  }, [profileUser]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const form = useForm<z.infer<typeof changeAvatarSchema>>({
    resolver: zodResolver(changeAvatarSchema),
    defaultValues: {
      avatar: undefined
    }
  })



  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<File | null>(null);

  const onSubmit = async (data: z.infer<typeof changeAvatarSchema>) => {
    setIsUploadingAvatar(true)
    try {
      const avatarFile = data.avatar
      
      if (!avatarFile) return
      const formData = new FormData;
      formData.append("avatar", avatarFile)

      const response = await api.post("/api/change-avatar", formData)

      dispatch(updateUserDetails(response.data.data))
      toast.message(response.data.message)
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse<unknown>>
      let errorMessage = AxiosError.response?.data.message
      toast("Uploading avatar failed ",
        {
          description: errorMessage
        })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleAvatarSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setErrors({ avatar: "Please select an image file" });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors({ avatar: "Image size must be less than 5MB" });
        return;
      }

      avatarFileRef.current = file;
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (onAvatarUpload) {
        setIsUploadingAvatar(true);
        try {
          const avatarUrl = await onAvatarUpload(file);
          setAvatarPreview(avatarUrl);
          setErrors({});
        } catch (error) {
          setErrors({
            avatar:
              error instanceof Error
                ? error.message
                : "Failed to upload avatar",
          });
        } finally {
          setIsUploadingAvatar(false);
        }
      }
    },
    [onAvatarUpload]
  );

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarRemove = async () => {
    if (onAvatarRemove) {
      setIsUploadingAvatar(true);
      try {
        await onAvatarRemove();
        setAvatarPreview(null);
        avatarFileRef.current = null;
        setErrors({});
      } catch (error) {
        setErrors({
          avatar:
            error instanceof Error ? error.message : "Failed to remove avatar",
        });
      } finally {
        setIsUploadingAvatar(false);
      }
    } else {
      setAvatarPreview(null);
      avatarFileRef.current = null;
    }
  };


  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (!file) {
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    },
    [handleAvatarSelect]
  );


  if (!profileUser?._id || isUploadingAvatar) {
    return (
      <ProfileSettingsSkeleton />
    )
  }


  return (

    <div className="p-4" >
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <CardTitle className="wrap-break-word">Profile Settings</CardTitle>
              <CardDescription className="wrap-break-word">
                See your profile information and avatar
              </CardDescription>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                className="w-full sm:w-auto"
                disabled={isSaving}

                type="submit"
              >
                {isUploadingAvatar ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span className="whitespace-nowrap">Saving…</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span className="whitespace-nowrap">Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {/* {errors._general && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-destructive text-sm">{errors._general}</p>
            </div>
          )} */}

            {/* Avatar Upload */}
            <div className="flex flex-col gap-4" >

              <FieldLabel>Profile Picture</FieldLabel>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div
                  className={cn(
                    "relative flex size-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors",
                    isUploadingAvatar
                      ? "border-primary bg-primary/5"
                      : "border-muted bg-muted/30 hover:border-primary/50"
                  )}
                  onClick={handleAvatarClick}
                // onDragOver={handleDragOver}
                // onDrop={handleDrop}
                >
                  {avatarPreview ? (
                    <>
                      <Image
                        alt="Profile avatar"
                        className="object-cover"
                        fill
                        sizes="96px"
                        src={avatarPreview}
                        unoptimized
                      />
                      {isUploadingAvatar && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                          <Loader2 className="size-6 animate-spin text-primary" />
                        </div>
                      )}
                    </>
                  ) : (
                    <Camera className="size-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={handleAvatarClick}
                      type="button"
                      variant="outline"
                    >
                      <Camera className="size-4" />
                      {avatarPreview ? "Change Photo" : "Upload Photo"}
                    </Button>
                    {/* {avatarPreview && (
                    <Button
                      onClick={handleAvatarRemove}
                      type="button"
                      variant="outline"
                    >
                      <X className="size-4" />
                      Remove
                    </Button>
                  )} */}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Drag and drop an image here, or click to browse. Max size: 5MB
                  </p>
                  {errors.avatar && (
                    <p className="text-destructive text-xs">{errors.avatar}</p>
                  )}
                </div>
                <Controller
                  name="avatar"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (!file) return;

                          // Update React Hook Form
                          field.onChange(file);

                          // Show preview
                          setAvatarPreview(URL.createObjectURL(file));
                        }}
                      />

                      {fieldState.error && (
                        <p className="text-destructive text-sm">
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="Full Name">
                  Full Name <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      id="name"
                      placeholder={profileUser?.fullName}
                      disabled={true}
                    />
                  </InputGroup>

                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <FieldContent>
                  <div className="flex flex-col gap-2">
                    <InputGroup>
                      <InputGroupInput
                        disabled={true}
                        id="email"
                        placeholder={profileUser?.email}
                      />
                    </InputGroup>
                  </div>
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </FieldContent>
              </Field>
            </div>
          </div>
        </CardContent>
      </form>

    </div>

  );

}
