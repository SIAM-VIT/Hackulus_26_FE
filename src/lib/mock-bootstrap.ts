/**
 * mock-bootstrap.ts
 * -----------------
 * Side-effectful module: importing this file will activate the mock backend
 * if NEXT_PUBLIC_MOCK_BACKEND=true (checked inside setupMockBackend).
 *
 * This runs synchronously at module load time in the browser, which ensures
 * the axios interceptors are registered before AuthProvider fires its first
 * API request.
 */
import { setupMockBackend } from "@/lib/mock-backend";

setupMockBackend();
