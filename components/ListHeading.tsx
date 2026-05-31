import {View, Text, TouchableOpacity} from 'react-native'
import React from 'react'

const ListHeading = ({title}:ListHeadingProps) => {
    return (
        <View className="list-head">
            <Text className='list-title'>{title}</Text>
            <TouchableOpacity className="list-action">
                <Text className='list-action-text'>View all</Text>
            </TouchableOpacity>
        </View>
    )
}
export default ListHeading
