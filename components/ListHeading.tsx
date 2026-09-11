import { Text, TouchableOpacity, View } from 'react-native'



const ListHeading = ({title, onViewAll,actionLabel="View all"}:ListHeadingProps) => {
    return (
        <View className="list-head">
            <Text className='list-title'>{title}</Text>
            {onViewAll &&(
            <TouchableOpacity className="list-action" onPress={onViewAll}>
                <Text className='list-action-text'>{actionLabel}</Text>
            </TouchableOpacity>
            )}
        </View>
    )
}
export default ListHeading