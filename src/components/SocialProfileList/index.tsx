import React, { PureComponent, Fragment } from 'react';
import { Button, Item } from 'semantic-ui-react'

interface SocialProfileListProps {
  auth: any;
  providerData: any[];
  unlinkedProvider: any;
}

class SocialProfileList extends PureComponent<SocialProfileListProps> {

  /**
   * Unlinks a provider from the current user account
   */
  handleProviderUnlink = async (e: React.MouseEvent, provider: string) => {
    const { auth, unlinkedProvider } = this.props;

    if (window.confirm(`Do you really want to unlink ${provider}?`)) {
      const providers = await auth()
        .currentUser.unlink(`${provider}.com`)
        .catch((err: Error) => console.error(err));

      unlinkedProvider(provider, providers.providerData);
    }
  };

  renderProfileList = ({ providerId, photoURL }: { providerId: string; photoURL: string }) => {
    const providerName = providerId.split('.')[0];

    return (
      <Item.Group key='providers'>
        <Item key={providerName}>
          <Item.Image
            src={photoURL}
            alt={providerName}
            size='tiny'
            circular
          />
          <Item.Content>
            <Item.Header as='h1'>{providerName}</Item.Header>
            <Item.Meta>
              <Button
                primary
                onClick={(e: React.MouseEvent) => this.handleProviderUnlink(e, providerName)}
              >
                Unlink
              </Button>
            </Item.Meta>
          </Item.Content>
        </Item>
      </Item.Group>
    );
  };

  render() {
    return (
      <Fragment>
        <p>
          <strong>Connected Social Accounts</strong>
        </p>
        <div>
          {this.props.providerData.map(this.renderProfileList)}
        </div>
      </Fragment>
    );
  }
}

export default SocialProfileList;
