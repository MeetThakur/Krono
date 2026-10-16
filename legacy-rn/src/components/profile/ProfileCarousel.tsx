import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { UnifiedProfile } from "../../types/user";
import { ProfileCard } from "../ui/ProfileCard";
import { ProfileDetailModal } from "./ProfileDetailModal";

interface ProfileCarouselProps {
  profiles: UnifiedProfile[];
}

export const ProfileCarousel: React.FC<ProfileCarouselProps> = ({
  profiles,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<UnifiedProfile | null>(
    null,
  );

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        decelerationRate="fast"
      >
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onPress={() => setSelectedProfile(profile)}
          />
        ))}
      </ScrollView>

      <ProfileDetailModal
        profile={selectedProfile}
        visible={selectedProfile !== null}
        onDismiss={() => setSelectedProfile(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 16,
  },
});
