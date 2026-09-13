import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { EmptyState } from "@/components/deck/EmptyState";
import { Button } from "@/components/deck/Button";

export function UnauthorizedPage() {
  return (
    <EmptyState
      icon={Lock}
      eyebrow="403"
      title="Access Denied"
      description="You don't have permission to access this resource. Your role doesn't include the required privileges."
      action={
        <div className="flex gap-3">
          <Button variant="secondary" asChild>
            <Link to="/overview">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild>
            <Link to="/login">
              Sign in as different user
            </Link>
          </Button>
        </div>
      }
    />
  );
}