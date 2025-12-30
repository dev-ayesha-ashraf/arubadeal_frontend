import { useState } from "react";
import LoginDialog from "@/components/common/Login";

const LoginPage = () => {
  const [showLoginDialog, setShowLoginDialog] = useState(true);

  return (
    <div>
      <LoginDialog
        showLoginDialog={showLoginDialog}
        setShowLoginDialog={setShowLoginDialog}
      />
    </div>
  );
};

export default LoginPage;
