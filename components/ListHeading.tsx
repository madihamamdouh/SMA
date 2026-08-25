import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'



const ListHeading = ({title, onViewAll}:ListHeadingProps) => {
    return (
        <View className="list-head">
            <Text className='list-title'>{title}</Text>
            {onViewAll &&(
            <TouchableOpacity className="list-action" onPress={onViewAll}>
                <Text className='list-action-text'>View all</Text>
            </TouchableOpacity>
            )}
        </View>
    )
}
export default ListHeading