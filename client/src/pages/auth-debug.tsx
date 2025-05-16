import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Página de depuración para autenticación
export default function AuthDebug() {
  console.log("AuthDebug page rendering");
  const { user, isLoading, error, loginMutation, registerMutation, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Estados para formularios
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState<'creator' | 'audience'>('audience');
  
  // Estado del servidor
  const [serverStatus, setServerStatus] = useState<any>(null);
  
  // Verificar estado del servidor
  const checkServer = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      setServerStatus({
        status: res.status,
        data: data
      });
    } catch (err) {
      setServerStatus({
        error: "Error al conectar con el servidor",
        details: err
      });
    }
  };
  
  // Verificar al cargar
  useEffect(() => {
    checkServer();
  }, []);
  
  // Función de inicio de sesión
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast({
        title: "Error",
        description: "Nombre de usuario es requerido",
        variant: "destructive"
      });
      return;
    }
    
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          toast({
            title: "Éxito",
            description: "Has iniciado sesión correctamente"
          });
          checkServer();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "No se pudo iniciar sesión",
            variant: "destructive"
          });
        }
      }
    );
  };
  
  // Función de registro
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast({
        title: "Error",
        description: "Nombre de usuario es requerido",
        variant: "destructive"
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    
    registerMutation.mutate(
      { 
        username, 
        password, 
        email: email || undefined,
        userRole 
      },
      {
        onSuccess: () => {
          toast({
            title: "Éxito",
            description: "Te has registrado correctamente"
          });
          checkServer();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "No se pudo completar el registro",
            variant: "destructive"
          });
        }
      }
    );
  };
  
  // Función de cierre de sesión
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Éxito",
          description: "Has cerrado sesión correctamente"
        });
        // Forzar recarga para actualizar estado
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  };
  
  // Función para forzar recarga
  const forceRefresh = () => {
    window.location.reload();
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Depuración de Autenticación</h1>
      
      <div className="space-y-6">
        {/* Información del usuario actual */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Autenticación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">¿Está cargando?</p>
                <p>{isLoading ? "Sí" : "No"}</p>
              </div>
              
              <div>
                <p className="font-semibold">¿Autenticado?</p>
                <p>{user ? "Sí" : "No"}</p>
              </div>
              
              {user && (
                <div>
                  <p className="font-semibold">Usuario:</p>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
              
              {error && (
                <div>
                  <p className="font-semibold text-destructive">Error:</p>
                  <pre className="bg-destructive/10 p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(error, null, 2)}
                  </pre>
                </div>
              )}
              
              {serverStatus && (
                <div>
                  <p className="font-semibold">Respuesta del servidor (/api/user):</p>
                  <pre className="bg-muted p-4 rounded-md text-sm overflow-auto">
                    {JSON.stringify(serverStatus, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={checkServer} variant="outline">Verificar Estado</Button>
            <Button onClick={forceRefresh}>Forzar Recarga</Button>
          </CardFooter>
        </Card>
        
        {/* Formularios de autenticación */}
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingresa tu nombre de usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Registrarse</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Nombre de usuario</Label>
                    <Input
                      id="reg-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Crea un nombre de usuario"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Crea una contraseña"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email (opcional)</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de cuenta</Label>
                    <RadioGroup 
                      value={userRole} 
                      onValueChange={(val) => setUserRole(val as 'creator' | 'audience')}
                      className="flex flex-col space-y-3 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="audience" id="audience" />
                        <Label htmlFor="audience" className="cursor-pointer">
                          Audiencia (puedo votar)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="creator" id="creator" />
                        <Label htmlFor="creator" className="cursor-pointer">
                          Creador (puedo recibir votos)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full">
                    {registerMutation.isPending ? "Registrando..." : "Registrarse"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Acciones de usuario */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <Button onClick={handleLogout} variant="destructive" className="w-full">
                Cerrar Sesión
              </Button>
            ) : (
              <p className="text-muted-foreground text-center">No hay sesión activa</p>
            )}
            
            <div className="flex justify-center space-x-4 pt-4">
              <Link href="/">
                <Button variant="outline">Volver al Inicio</Button>
              </Link>
              
              {user && (
                <Link href="/dashboard">
                  <Button>Ir al Dashboard</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}