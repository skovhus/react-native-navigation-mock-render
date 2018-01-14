import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class MainScreen extends Component {
  componentDidMount() {
    this.props.navigator.showModal({
      screen: 'example.Intro',
      passProps: {
        done: () => {
          this.props.navigator.showModal({
            screen: 'example.Welcome',
            passProps: {
              name: 'foo',
            },
          });
        },
      },
    });
  }

  render() {
    return (
      <View>
        <Text>Boring main screen...</Text>
      </View>
    );
  }
}
