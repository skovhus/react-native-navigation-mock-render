import React, { Component } from 'react';
import { Text, View } from 'react-native';

export default class MainScreen extends Component {
  componentDidMount() {
    console.log('::: MainScreen componentDidMount');
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
    console.log('::: MainScreen componentDidMount done');
  }

  render() {
    console.log('::: MainScreen render');
    return (
      <View>
        <Text>Boring main screen...</Text>
      </View>
    );
  }
}
