import { useState } from "react";
import { useManageRewards } from "../../hooks/useManageRewards";
import { AddRewardForm } from "../../components/rewards/AddRewardForm";
import { EditRewardModal } from "../../components/rewards/EditRewardModal";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Alert from "../../components/ui/Alert";
import {
  PencilSquareIcon,
  ArchiveBoxXMarkIcon,
  ArrowPathIcon,
  CameraIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

function ManageRewards() {
  // Usamos nuestro hook personalizado para obtener toda la lógica y el estado.
  const {
    rewards,
    loading,
    error,
    success,
    addReward,
    updateReward,
    toggleRewardStatus,
    userRole,
  } = useManageRewards();

  // Estado local que solo pertenece a la UI de esta página.
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState(null);

  // --- MANEJADORES DE EVENTOS DE UI ---
  const handleEditClick = (reward) => {
    // Prevent Admins from editing global rewards
    if (userRole === "Admin" && reward.companyId === null) {
      Swal.fire(
        "Acción no permitida",
        "Los administradores no pueden editar recompensas globales.",
        "warning"
      );
      return;
    }
    setEditingReward(reward);
    setIsEditModalOpen(true);
  };

  const handleToggleClick = async (reward) => {
    const action = reward.isActive ? "desactivar" : "activar";
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Realmente quieres ${action} la recompensa "${reward.nombre}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await toggleRewardStatus(reward);
      } catch (err) {
        Swal.fire(
          "Error",
          err.message || `No se pudo ${action} la recompensa.`,
          "error"
        );
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Administrar Recompensas
      </h1>

      <AddRewardForm onAdd={addReward} />

      <div className="h-10">
        {error && <Alert type="error">{error}</Alert>}
        {success && <Alert type="success">{success}</Alert>}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-md">
        {loading ? (
          <div className="flex justify-center p-10">
            <Spinner size="lg" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Imagen
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Puntos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Etiquetas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase pr-6">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rewards.map((reward) => (
                <tr key={reward.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.nombre}
                        className="h-10 w-10 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <CameraIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {reward.nombre}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {reward.pointsRequired}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                    {reward.stock === null ? "Infinito" : reward.stock}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {Array.isArray(reward.tags) && reward.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {reward.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Ninguno
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reward.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {reward.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 pr-6">
                    {(userRole === "Manager" && reward.companyId === null) ||
                    (userRole === "Admin" && reward.companyId !== null) ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditClick(reward)}
                        >
                          <PencilSquareIcon className="h-4 w-4 mr-1" /> Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={reward.isActive ? "danger" : "primary"}
                          onClick={() => handleToggleClick(reward)}
                        >
                          {reward.isActive ? (
                            <ArchiveBoxXMarkIcon className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowPathIcon className="h-4 w-4 mr-1" />
                          )}
                          {reward.isActive ? "Inactivar" : "Activar"}
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        {userRole === "Admin"
                          ? "Global (No editable)"
                          : "De Compañía"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EditRewardModal
        reward={editingReward}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={updateReward}
      />
    </div>
  );
}

export default ManageRewards;
