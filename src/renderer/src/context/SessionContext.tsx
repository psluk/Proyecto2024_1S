import React, { createContext } from "react";

interface Session {
  name: string;
  email: string;
}

interface SessionContextType {
  session: Session | null;
  login: (name: string, email: string) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

const SessionContextProvider = ({ children }) => {
  const [session, setSession] = React.useState<Session | null>(null);

  const login = (name: string, email: string) => {
    console.log("CONTEXT - Logging in as", name, email);
    setSession({ name, email });
  };

  const logout = () => {
    console.log("CONTEXT - Logging out");
    setSession(null);
  }

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export { SessionContext, SessionContextProvider };
