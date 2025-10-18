import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Make 'jest' available as an alias for 'vi' for compatibility with existing tests
globalThis.jest = vi;

export const mockedNavigator = vi.fn();

vi.mock("react-router-dom", async () => {
	const actual = await vi.importActual("react-router-dom");
	return {
		...actual,
		useParams: vi.fn(),
		usePathName: vi.fn(),
		useNavigate: () => mockedNavigator
	};
});
