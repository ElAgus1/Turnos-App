"use client";

import { useState } from "react";
import { ProfileImageUploader } from "./profile-image-uploader";

interface ProfileImageSectionProps {
  initialImage: string | null | undefined;
  userName: string;
}

export function ProfileImageSection({
  initialImage,
  userName,
}: ProfileImageSectionProps) {
  const [profileImage, setProfileImage] = useState(initialImage);

  const handleImageUpload = (imageUrl: string) => {
    setProfileImage(imageUrl);
  };

  return (
    <div className="md:col-span-1 flex flex-col items-center p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-xl h-fit text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
        Foto de Perfil
      </p>

      <ProfileImageUploader
        currentImage={profileImage}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
}
