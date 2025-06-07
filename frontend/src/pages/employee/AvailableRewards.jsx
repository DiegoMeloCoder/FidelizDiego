import { useState, useEffect, useCallback } from "react"; // Import useCallback
import apiClient from "../../services/api"; // Import API client
import { useAuth } from "../../contexts/AuthContext.jsx";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import Swal from "sweetalert2";
import {
  GiftIcon,
  StarIcon,
  CheckCircleIcon,
  SparklesIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";

function AvailableRewards() {
  const {
    currentUser,
    userData,
    loading: authLoading,
    refreshUserData,
  } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [redeemingId, setRedeemingId] = useState(null);
  const [redeemError, setRedeemError] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState("");
  const [votingState, setVotingState] = useState({}); // { [rewardId]: { loading: bool, error: string, userVote: 'like'|'dislike'|null } }

  // Function to clear messages after a delay
  const clearMessages = () => {
    setTimeout(() => {
      setListError("");
      setRedeemError("");
      setRedeemSuccess("");
      // Clear voting errors too if needed, or handle separately
      // setVotingState(prev => ({ ...prev, [rewardId]: { ...prev[rewardId], error: '' } }));
    }, 4000); // Clear after 4 seconds
  };

  // Define fetchRewards outside useEffect, memoized with useCallback
  const fetchRewards = useCallback(async () => {
    // Use nested company ID check
    if (!userData?.company?.id) {
      setListError(
        "La información de la empresa del empleado no está disponible."
      );
      setLoading(false);
      return;
    }
    console.log(
      `AvailableRewards: Fetching rewards for companyId: ${userData.company.id}`
    );
    setLoading(true);
    setListError(""); // Clear list error before fetch
    // Don't clear redeem success/error here, let clearMessages handle it
    try {
      // Fetch rewards using API (backend filters by company, frontend filters active)
      const response = await apiClient.get("/rewards");
      // Ensure isActive defaults to true if missing
      const list = response.data.data.rewards.map((reward) => ({
        ...reward,
        isActive: reward.isActive !== undefined ? reward.isActive : true,
      }));
      console.log("AvailableRewards: Fetched rewards list:", list);
      setRewards(list);
    } catch (err) {
      console.error("Error fetching rewards:", err);
      setListError(err.message || "No se pudieron cargar las recompensas.");
      clearMessages(); // Clear error after delay
    } finally {
      setLoading(false);
    }
    // }, [userData?.company?.id]); // Dependency: fetchRewards needs to be recreated if companyId changes
    // --> Let's remove companyId dependency for now, assuming rewards list doesn't change often based on company alone
    // --> Re-add if necessary, but might cause re-fetches if userData object changes reference unnecessarily
  }, []); // Fetch only once on mount for now

  // Fetch rewards on initial load or when companyId changes
  useEffect(() => {
    if (authLoading) return; // Wait for auth to be ready

    // Call the memoized fetchRewards function
    fetchRewards();

    // }, [userData?.company?.id, authLoading, fetchRewards]); // Adjust dependencies if fetchRewards changes
  }, [authLoading, fetchRewards]); // Fetch when auth is ready

  // Handle Redeem Reward
  const handleRedeem = async (rewardId, pointsRequired, rewardName) => {
    setRedeemingId(rewardId);
    setRedeemError("");
    setRedeemSuccess("");

    if (!currentUser || !userData) {
      setRedeemError("Datos de usuario no disponibles.");
      setRedeemingId(null);
      clearMessages();
      return;
    }
    if ((userData.points ?? 0) < pointsRequired) {
      setRedeemError(
        `No tienes suficientes puntos para redimir ${rewardName}.`
      );
      setRedeemingId(null);
      clearMessages();
      return;
    }
    // Check stock before confirming (client-side check for immediate feedback)
    const rewardToCheck = rewards.find((r) => r.id === rewardId);
    if (rewardToCheck && rewardToCheck.stock === 0) {
      setRedeemError(`La recompensa "${rewardName}" está agotada.`);
      setRedeemingId(null);
      clearMessages();
      return;
    }

    const result = await Swal.fire({
      title: `¿Redimir "${rewardName}"?`,
      text: `Esta recompensa costará ${pointsRequired} puntos`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Redimir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) {
      setRedeemingId(null);
      return;
    }

    try {
      // Call backend API to redeem reward (handles DB transaction)
      const response = await apiClient.post(
        `/redemptions/rewards/${rewardId}/redeem`
      );
      const redeemedData = response.data.data;

      // Mostrar mensaje de éxito con SweetAlert2
      await Swal.fire({
        title: "¡Redimido con éxito!",
        text: `Has canjeado ${rewardName}. Nuevo balance: ${redeemedData.employeeNewBalance} puntos`,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      // Refresh user data in context to update points balance in UI
      refreshUserData();
      // Re-fetch rewards to update stock display
      fetchRewards();
    } catch (err) {
      console.error("Error redeeming reward:", err);
      // Mostrar error con SweetAlert2
      await Swal.fire({
        title: "Error",
        text:
          err.message ||
          `No se pudo redimir ${rewardName}. Por favor intenta de nuevo.`,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setRedeemingId(null);
    }
  };

  // Handle Vote Reward
  const handleVote = async (rewardId, voteType) => {
    setVotingState((prev) => ({
      ...prev,
      [rewardId]: { ...prev[rewardId], loading: true, error: "" },
    }));

    try {
      const response = await apiClient.post(`/rewards/${rewardId}/vote`, {
        voteType,
      });
      const updatedReward = response.data.data.reward; // Get updated reward with counts

      // Update the specific reward in the local state
      setRewards((prevRewards) =>
        prevRewards.map((r) =>
          r.id === rewardId
            ? {
                ...r,
                likes: updatedReward.likes,
                dislikes: updatedReward.dislikes,
              }
            : r
        )
      );

      // Update voting state for this reward
      setVotingState((prev) => ({
        ...prev,
        [rewardId]: { loading: false, error: "", userVote: voteType }, // Store user's current vote? Or just success?
      }));
      // Optionally show a success message or just update button appearance
    } catch (err) {
      console.error(`Error voting ${voteType} on reward ${rewardId}:`, err);
      const errorMsg =
        err.response?.data?.message ||
        `No se pudo registrar el voto de ${voteType}.`;
      setVotingState((prev) => ({
        ...prev,
        [rewardId]: { ...prev[rewardId], loading: false, error: errorMsg },
      }));
      // Optionally use Alert component for voting errors
      // clearMessages(); // Maybe clear voting errors differently
    }
  };

  const isLoading = loading || authLoading;
  const currentPoints = userData?.points ?? 0;

  return (
    <div className="space-y-6">
      {/* Header and Points */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <GiftIcon className="h-7 w-7 mr-2 text-rose-600" />
          Recompensas Disponibles
        </h1>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Tus Puntos</p>
          <p className="text-2xl font-bold text-indigo-600 flex items-center justify-end">
            <StarIcon className="h-5 w-5 mr-1 text-yellow-400" />
            {authLoading ? <Spinner size="xs" /> : currentPoints}
          </p>
        </div>
      </div>

      {/* Display feedback messages */}
      <div className="space-y-3">
        {listError && (
          <Alert type="error" onClose={() => setListError("")}>
            {listError}
          </Alert>
        )}
        {redeemError && (
          <Alert type="error" onClose={() => setRedeemError("")}>
            {redeemError}
          </Alert>
        )}
        {redeemSuccess && (
          <Alert type="success" onClose={() => setRedeemSuccess("")}>
            {redeemSuccess}
          </Alert>
        )}
      </div>

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rewards.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">
              No hay recompensas disponibles actualmente para tu empresa.
            </p>
          ) : (
            rewards.map((reward) => {
              // Ensure isActive check handles undefined correctly (defaults to true)
              const isActive = reward.isActive !== false;
              if (!isActive) return null; // Skip rendering inactive rewards

              const canAfford = currentPoints >= reward.pointsRequired;
              const isRedeemingThis = redeemingId === reward.id;
              const isOutOfStock = reward.stock === 0; // Check if stock is exactly 0

              return (
                // Refined Reward Card
                <div
                  key={reward.id}
                  className={`bg-white border rounded-lg shadow-md flex flex-col overflow-hidden transition-opacity duration-300 ${
                    isRedeemingThis ? "opacity-70" : ""
                  }`}
                >
                  {/* Display Reward Image - Use aspect-ratio for container */}
                  <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <GiftIcon className="h-16 w-16 text-gray-400" />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    {/* Add Global indicator */}
                    {reward.companyId === null && (
                      <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full self-start mb-2 inline-flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m0 0a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9H3m6 0a3 3 0 11-6 0 3 3 0 016 0zM12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Recompensa Global
                      </span>
                    )}
                    {/* Recommendation Badge */}
                    {reward.recommendation?.score > 0 && (
                      <span
                        className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full self-start mb-2 inline-flex items-center"
                        title={`Razones: ${reward.recommendation.reasons.join(
                          ", "
                        )}`}
                      >
                        <SparklesIcon className="h-3 w-3 mr-1" />
                        Recomendada
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-800 mb-1 flex-grow">
                      {reward.nombre}
                    </h3>{" "}
                    {/* Use nombre */}
                    {/* Use brand-primary for points text */}
                    <div className="flex items-center text-brand-primary font-bold text-xl mt-2">
                      <StarIcon className="h-5 w-5 mr-1 text-yellow-400" />{" "}
                      {/* Keep star yellow */}
                      {reward.pointsRequired}
                      {/* Use brand-secondary for "Points" label */}
                      <span className="text-sm font-medium text-brand-secondary ml-1">
                        Puntos
                      </span>
                    </div>
                    {/* Display Stock if finite */}
                    {reward.stock !== null && (
                      <p
                        className={`text-xs mt-1 ${
                          isOutOfStock
                            ? "text-red-600 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        Stock: {isOutOfStock ? "0 (Agotado)" : reward.stock}
                      </p>
                    )}
                    {/* Display Likes/Dislikes */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="inline-flex items-center">
                        <HandThumbUpIcon className="h-4 w-4 mr-1" />{" "}
                        {reward.likes ?? 0}
                      </span>
                      <span className="inline-flex items-center">
                        <HandThumbDownIcon className="h-4 w-4 mr-1" />{" "}
                        {reward.dislikes ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Redeem Button Area */}
                  <div className="p-4 pt-2 border-t border-gray-200 mt-auto">
                    {" "}
                    {/* Added mt-auto */}
                    {/* Vote Buttons */}
                    <div className="flex justify-center space-x-3 mb-3">
                      <button
                        onClick={() => handleVote(reward.id, "like")}
                        disabled={votingState[reward.id]?.loading}
                        className={`p-1 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 transition ${
                          votingState[reward.id]?.userVote === "like"
                            ? "text-green-600 bg-green-100"
                            : ""
                        }`}
                        aria-label="Like reward"
                      >
                        {votingState[reward.id]?.loading &&
                        votingState[reward.id]?.voteType === "like" ? (
                          <Spinner size="xs" />
                        ) : (
                          <HandThumbUpIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleVote(reward.id, "dislike")}
                        disabled={votingState[reward.id]?.loading}
                        className={`p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition ${
                          votingState[reward.id]?.userVote === "dislike"
                            ? "text-red-600 bg-red-100"
                            : ""
                        }`}
                        aria-label="Dislike reward"
                      >
                        {votingState[reward.id]?.loading &&
                        votingState[reward.id]?.voteType === "dislike" ? (
                          <Spinner size="xs" />
                        ) : (
                          <HandThumbDownIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {/* Display voting error for this card */}
                    {votingState[reward.id]?.error && (
                      <p className="text-xs text-red-600 text-center mb-2">
                        {votingState[reward.id]?.error}
                      </p>
                    )}
                    {/* Redeem Button */}
                    <Button
                      onClick={() =>
                        handleRedeem(
                          reward.id,
                          reward.pointsRequired,
                          reward.nombre
                        )
                      }
                      // Disable if not affordable OR redeeming OR out of stock
                      disabled={!canAfford || isRedeemingThis || isOutOfStock}
                      // Use primary variant for redeem button (already themed)
                      variant={
                        canAfford && !isOutOfStock ? "primary" : "secondary"
                      }
                      // Remove specific green colors, rely on Button component's variant styles
                      className={`w-full inline-flex items-center justify-center ${
                        !canAfford || isOutOfStock
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "" // Keep disabled style
                      }`}
                      size="sm"
                    >
                      {isRedeemingThis ? (
                        <Spinner
                          size="sm"
                          color="text-white"
                          className="mr-2"
                        />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5 mr-1.5" />
                      )}
                      {/* Adjust button text based on stock */}
                      {isRedeemingThis
                        ? "Redimiendo..."
                        : isOutOfStock
                        ? "Agotado"
                        : canAfford
                        ? "Redimir Ahora"
                        : "No tienes suficientes puntos"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
          {/* Message if all fetched rewards are inactive */}
          {!isLoading &&
            rewards.length > 0 &&
            rewards.every((r) => r.isActive === false) && (
              <p className="text-gray-500 col-span-full text-center py-10">
                No hay recompensas activas disponibles actualmente.
              </p>
            )}
        </div>
      )}
    </div>
  );
}

export default AvailableRewards;
