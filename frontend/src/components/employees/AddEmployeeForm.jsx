import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";
import { PlusIcon } from "@heroicons/react/24/outline";

export function AddEmployeeForm({ onAddEmployee }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    setIsAdding(true);
    setError("");
    try {
      await onAddEmployee({ nombre: name, email, password });
      // Reset form on success
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "No se pudo agregar el empleado.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4"
    >
      <h2 className="text-lg font-medium text-gray-700">
        Agregar Nuevo Empleado
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="new-employee-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre Completo
          </label>
          <Input
            id="new-employee-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            required
            autoComplete="name"
            className="mt-0 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="new-employee-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Correo Electrónico
          </label>
          <Input
            id="new-employee-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan.perez@empresa.com"
            required
            autoComplete="email"
            className="mt-0 w-full"
          />
        </div>
        <div>
          <label
            htmlFor="new-employee-password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <Input
            id="new-employee-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mín. 6 caracteres"
            required
            minLength="6"
            autoComplete="new-password"
            className="mt-0 w-full"
          />
        </div>
      </div>
      {error && <Alert type="error">{error}</Alert>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isAdding}>
          {isAdding ? (
            <Spinner size="sm" color="text-white" className="mr-2" />
          ) : (
            <PlusIcon className="h-5 w-5 mr-1.5" />
          )}
          {isAdding ? "Agregando..." : "Agregar Empleado"}
        </Button>
      </div>
    </form>
  );
}

export default AddEmployeeForm;
