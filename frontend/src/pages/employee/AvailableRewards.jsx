import { useAvailableRewards } from "../../hooks/useAvailableRewards";
import { RewardCard } from "../../components/rewards/RewardCard";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import Swal from "sweetalert2";
import { GiftIcon, StarIcon } from "@heroicons/react/24/outline";

function AvailableRewards() {
  const { rewards, loading, error, userPoints, redeemReward, voteOnReward } =
    useAvailableRewards();

  const handleRedeem = async (reward) => {
    if (reward.stock === 0) {
      Swal.fire(
        "Agotado",
        `La recompensa "${reward.nombre}" no tiene stock disponible.`,
        "warning"
      );
      return;
    }

    if (userPoints < reward.pointsRequired) {
      Swal.fire(
        "Puntos Insuficientes",
        `Necesitas ${reward.pointsRequired} puntos para canjear "${reward.nombre}".`,
        "error"
      );
      return;
    }

    const result = await Swal.fire({
      title: `¿Canjear "${reward.nombre}"?`,
      text: `Esto costará ${reward.pointsRequired} puntos de tu saldo.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, canjear",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const redeemedData = await redeemReward(reward.id);
        Swal.fire({
          title: "¡Canjeado con éxito!",
          text: `Has canjeado ${reward.nombre}. Tu nuevo saldo es: ${redeemedData.employeeNewBalance} puntos.`,
          icon: "success",
        });
      } catch (err) {
        Swal.fire(
          "Error",
          err.message || `No se pudo canjear ${reward.nombre}.`,
          "error"
        );
      }
    }
  };

  const handleVote = async (rewardId, voteType) => {
    try {
      await voteOnReward(rewardId, voteType);
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.message || "Failed to vote",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow border">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <GiftIcon className="h-7 w-7 mr-2 text-rose-600" />
          Recompensas Disponibles
        </h1>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">Tus Puntos</p>
          <p className="text-2xl font-bold text-indigo-600 flex items-center justify-end">
            <StarIcon className="h-5 w-5 mr-1 text-yellow-400" />
            {loading ? <Spinner size="xs" /> : userPoints}
          </p>
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center items-center p-10">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {rewards.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">
              No hay recompensas disponibles actualmente.
            </p>
          ) : (
            rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userPoints={userPoints}
                onRedeem={() => handleRedeem(reward)}
                onVote={handleVote}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default AvailableRewards;
