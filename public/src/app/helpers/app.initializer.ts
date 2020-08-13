import { AuthenticationService } from '../services/authentication.service';

export function appInitializer(authenticationService: AuthenticationService) {
    return () => new Promise(resolve => {
        authenticationService.refreshToken()
            .add(resolve);
    });
}