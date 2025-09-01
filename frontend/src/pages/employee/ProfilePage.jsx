import { useAuth } from "../../contexts/AuthContext.jsx";
import { useUserProfile } from "../../hooks/useUserProfile.js";
import { UpdateProfileForm } from "../../components/profile/UpdateProfileForm.jsx";
import { SuggestRewardForm } from "../../components/profile/SuggestRewardForm.jsx";
import Spinner from "../../components/ui/Spinner";

function ProfilePage() {
  const { userData, loading: authLoading } = useAuth();
  const { handleProfileUpdate, handleRewardRequest } = useUserProfile();

  if (authLoading || !userData) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Mi Perfil</h1>
      <UpdateProfileForm userData={userData} onUpdate={handleProfileUpdate} />

      <SuggestRewardForm onSuggest={handleRewardRequest} />
    </div>
  );
}

export default ProfilePage;
