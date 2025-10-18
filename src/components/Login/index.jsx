import React, {useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import store from 'store';
import Layout from '../../containers/Layout';
import SocialButtonList from '../SocialButtonList';
import AnonymousLogin from '../AnonymousLogin';
import {Divider, Grid, Header, Segment} from 'semantic-ui-react';
import {auth} from '../../firebase';

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
		<Layout>
			<Grid textAlign="center" style={{height: '80vh'}} verticalAlign="middle">
				<Grid.Column style={{maxWidth: 450}}>
					<Segment>
						<Header as="h2">What is it?</Header>
						<p>PointWith.me is a way for remote teams to story point quickly and easily.
							Someone &ldquo;Drives&rdquo; your session and all the players open the link on their
							phone/desktop and just point issues as they cycle through</p>
					</Segment>
					<Segment>
						<Header as="h1">Sign In - It&rsquo;s FREE</Header>
						<Header sub>
							Quick join with just your name, or login with a social account
						</Header>
						<Divider horizontal>Or</Divider>
						<AnonymousLogin />
						<Divider horizontal>Or</Divider>
						<Header sub>
							Login with a social account - we don&rsquo;t use/store anything other
							than your account ID for OAuth
						</Header>
						<SocialButtonList currentUser={auth.auth.currentUser}/>
						<Link to="/about"></Link>
					</Segment>
				</Grid.Column>
			</Grid>
		</Layout>
	);
};

export default Login;
