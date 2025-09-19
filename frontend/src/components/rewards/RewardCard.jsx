import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import {
  GiftIcon,
  StarIcon,
  CheckCircleIcon,
  SparklesIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
} from "@heroicons/react/24/outline";

export function RewardCard({ reward, userPoints, onRedeem, onVote }) {
  const [currentUserVote, setCurrentUserVote] = useState(
    reward.userVote || null
  );
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [votingType, setVotingType] = useState(null);

  useEffect(() => {
    setCurrentUserVote(reward.userVote || null);
  }, [reward.userVote]);

  const canAfford = userPoints >= reward.pointsRequired;
  const isOutOfStock = reward.stock === 0;

  const handleRedeemClick = async () => {
    setIsRedeeming(true);
    await onRedeem(reward);
    setIsRedeeming(false);
  };

  const handleVoteClick = async (voteType) => {
    setVotingType(voteType);

    const newVoteType = currentUserVote === voteType ? null : voteType;
    setCurrentUserVote(newVoteType);

    try {
      await onVote(reward.id, voteType);
    } catch (err) {
      setCurrentUserVote(reward.userVote || null);
      throw err
    } finally {
      setVotingType(null);
    }
  };

  const likeButtonClasses = `p-1 rounded-full transition focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-green-500 ${
    currentUserVote === "like"
      ? "text-green-600 bg-green-100"
      : "text-gray-400 hover:text-green-500 hover:bg-green-100"
  }`;

  const dislikeButtonClasses = `p-1 rounded-full transition focus:outline-hidden focus:ring-2 focus:ring-offset-1 focus:ring-red-500 ${
    currentUserVote === "dislike"
      ? "text-red-600 bg-red-100"
      : "text-gray-400 hover:text-red-500 hover:bg-red-100"
  }`;

  return (
    <div className="bg-white border rounded-lg shadow-md flex flex-col overflow-hidden transition-shadow hover:shadow-xl">
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

      <div className="p-4 flex flex-col grow">
        <div className="flex items-center space-x-2 mb-2">
          {reward.companyId === null && (
            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
              Recompensa Global
            </span>
          )}
          {reward.recommendation?.score > 0 && (
            <span
              className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full"
              title={`Razones: ${reward.recommendation.reasons.join(", ")}`}
            >
              <SparklesIcon className="h-3 w-3 mr-1 inline" /> Recomendada
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-1 grow">
          {reward.nombre}
        </h3>

        <div className="flex items-center text-brand-primary font-bold text-xl mt-2">
          <StarIcon className="h-5 w-5 mr-1 text-yellow-400" />
          {reward.pointsRequired}
          <span className="text-sm font-medium text-brand-secondary ml-1">
            Puntos
          </span>
        </div>

        {reward.stock !== null && (
          <p
            className={`text-xs mt-1 ${
              isOutOfStock ? "text-red-600 font-semibold" : "text-gray-500"
            }`}
          >
            Stock: {isOutOfStock ? "Agotado" : reward.stock}
          </p>
        )}

        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
          <span className="inline-flex items-center">
            <HandThumbUpIcon className="h-4 w-4 mr-1" /> {reward.likes ?? 0}
          </span>
          <span className="inline-flex items-center">
            <HandThumbDownIcon className="h-4 w-4 mr-1" />{" "}
            {reward.dislikes ?? 0}
          </span>
        </div>
      </div>

      <div className="p-4 pt-2 border-t border-gray-200 mt-auto">
        <div className="flex justify-center space-x-3 mb-3">
          <button
            onClick={() => handleVoteClick("like")}
            disabled={!!votingType}
            className={likeButtonClasses}
          >
            {votingType === "like" ? (
              <Spinner size="xs" />
            ) : (
              <HandThumbUpIcon className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => handleVoteClick("dislike")}
            disabled={!!votingType}
            className={dislikeButtonClasses}
          >
            {votingType === "dislike" ? (
              <Spinner size="xs" />
            ) : (
              <HandThumbDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        <Button
          onClick={handleRedeemClick}
          disabled={!canAfford || isRedeeming || isOutOfStock}
          variant={canAfford && !isOutOfStock ? "primary" : "secondary"}
          className="w-full"
          size="sm"
        >
          {isRedeeming ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <CheckCircleIcon className="h-5 w-5 mr-1.5" />
          )}
          {isOutOfStock
            ? "Agotado"
            : canAfford
            ? "Redimir Ahora"
            : "Puntos Insuficientes"}
        </Button>
      </div>
    </div>
  );
}
