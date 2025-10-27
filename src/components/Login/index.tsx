import React, {useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import store from 'store';
import Layout from '@/containers/Layout';
import SocialButtonList from '../SocialButtonList';
import AnonymousLogin from '../AnonymousLogin';
import {auth} from '@/firebase';

const Login = () => {
	const navigate = useNavigate();
	useEffect(() => {
		const unsubscribe = auth.auth.onAuthStateChanged(user => {
			if (user) {
				const entryPoint = store.get('entryPoint');
				if (entryPoint) {
					store.remove('entryPoint');
					navigate(entryPoint);
				} else {
					navigate('/dashboard');
				}
			}
			// Don't navigate to '/' if no user - let them stay on login page
		});

		return () => unsubscribe();
	}, [navigate]);

	return (
		<Layout contentCenter>
			<div className="flex items-center justify-center min-h-[80vh]">
				<div className="w-full max-w-md space-y-6">
					{/* What is it? Card */}
					<div className="card text-center">
						<h2 className="text-2xl font-bold mb-4">What is it?</h2>
						<p className="text-gray-700">
							PointPal.app is a way for remote teams to story point quickly and easily.
							Someone "Drives" your session and all the players open the link on their
							phone/desktop and just point issues as they cycle through
						</p>
					</div>

					{/* Sign In Card */}
					<div className="card text-center">
						<h1 className="text-3xl font-bold mb-2">Sign In - It's FREE</h1>
						<p className="text-sm text-gray-600 mb-6">
							Quick join with just your name, or login with a social account
						</p>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">Or</span>
							</div>
						</div>

						<AnonymousLogin />

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">Or</span>
							</div>
						</div>

						<p className="text-sm text-gray-600 mb-4">
							Login with a social account - we don't use/store anything other
							than your account ID for OAuth
						</p>
						<SocialButtonList currentUser={auth.auth.currentUser}/>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Login;
