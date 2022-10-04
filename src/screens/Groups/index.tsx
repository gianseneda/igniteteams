import { useState, useCallback } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { Alert, FlatList } from "react-native";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { GroupCard } from "@components/GroupCard";
import { ListInput } from "@components/ListInput";
import { Button } from "@components/Button";
import { Loading } from "@components/Loading";

import { Container } from "./styles";
import { groupGetAll } from "@storage/group/groupGetAll";

export function Groups() {
  const navigation = useNavigation();
  const [groups, setGroups] = useState<string[]>([
    "Galera da Rocket",
    "Amigos",
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const handleNewGroup = () => {
    navigation.navigate("new");
  };

  const fetchGroups = async () => {
    try {
      setIsLoading(true);

      const data = await groupGetAll();
      setGroups(data);
    } catch (error) {
      Alert.alert("Turmas", "Não foi possível carregar as turmas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenGroup = (group: string) => {
    navigation.navigate("players", { group });
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  return (
    <Container>
      <Header />
      <Highlight title="Turmas" subtitle="Jogue com a sua turma" />

      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <GroupCard title={item} onPress={() => handleOpenGroup(item)} />
          )}
          contentContainerStyle={groups.length === 0 && { flex: 1 }}
          ListEmptyComponent={() => (
            <ListInput message="Que tal cadastrar a primeira turma?" />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Button title="Criar nova turma" onPress={handleNewGroup} />
    </Container>
  );
}
