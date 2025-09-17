/**
 * Un componente para mostrar el perfil de un creador o miembro del equipo.
 */
function CreatorProfile({ imgSrc, name, title }) {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <img
        src={imgSrc}
        alt={name}
        className="w-24 h-24 rounded-full object-cover mb-2 shadow-md"
      />
      <h3 className="font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

export default CreatorProfile;
