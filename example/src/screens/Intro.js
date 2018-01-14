import React, { Component } from 'react';
import { Button, View } from 'react-native';

export default class IntroScreen extends Component {
  onPressAcceptTerms = () => {
    this.props.done();
  };

  render() {
    return (
      <View>
        <Button title="Accept terms" onPress={this.onPressAcceptTerms} />
      </View>
    );
  }
}
