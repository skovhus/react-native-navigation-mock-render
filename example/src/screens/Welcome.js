import React, { Component } from 'react';
import { Button, Text, View } from 'react-native';

export default class WelcomeScreen extends Component {
  onPressThanks = () => {
    this.props.navigator.dismissAllModals();
  };

  render() {
    return (
      <View>
        <Text>Welcome {this.props.name}</Text>
        <Button title="Thanks" onPress={this.onPressThanks} />
      </View>
    );
  }
}
