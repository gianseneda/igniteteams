import { useState, useEffect, useRef } from "react";

import { Alert, FlatList, TextInput } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import { AppError } from "@utils/AppError";
import { playerAddByGroup } from "@storage/player/playerAddByGroup";
import { playersGetByGroupAndTeam } from "@storage/player/playersGetByGroupAndTeam";
import { PlayerStorageDTO } from "@storage/player/PlayerStorageDTO";

import { ButtonIcon } from "@components/ButtonIcon";
import { Header } from "@components/Header";
import { Input } from "@components/Input";
import { Filter } from "@components/Filter";
import { Button } from "@components/Button";
import { Highlight } from "@components/Highlight";
import { ListInput } from "@components/ListInput";
import { Loading } from "@components/Loading";
import { PlayerCard } from "@components/PlayerCard";

import { Container, Form, HeaderList, NumberOfPlayers } from "./styles";
import { playerRemoveByGroup } from "@storage/player/playerRemoveByGroup";
import { groupRemoveByName } from "@storage/group/groupRemoveByName";

type RouteParams = {
  group: string;
};

export function Players() {
  const route = useRoute();
  const navigation = useNavigation();
  const { group } = route.params as RouteParams;

  const newPlayerNameInputRef = useRef<TextInput>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [team, setTeam] = useState("Time A");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

  const handleAddPlayer = async () => {
    if (newPlayerName.trim().length === 0) {
      return Alert.alert(
        "Nova pessoa",
        "Informe o nome da pessoa para adicionar"
      );
    }

    const newPlayer = {
      name: newPlayerName,
      team,
    };

    try {
      await playerAddByGroup(newPlayer, group);

      newPlayerNameInputRef.current?.blur(); //tira o foco do inpput
      setNewPlayerName("");
      fetchPlayersByTeam();
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert("Nova pessoa", error.message);
      } else {
        Alert.alert("Nova pessoa", "Não foi possível adicionar");
      }
    }
  };

  const fetchPlayersByTeam = async () => {
    try {
      setIsLoading(true);
      const playersByTeam = await playersGetByGroupAndTeam(group, team);
      setPlayers(playersByTeam);
    } catch (error) {
      Alert.alert(
        "Pessoas",
        "Não foi possível carregar as pessoas do time selecionado"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlayer = async (playerName: string) => {
    try {
      await playerRemoveByGroup(playerName, group);
      fetchPlayersByTeam();
    } catch (error) {
      Alert.alert("Remover pessoa", "Não foi possível remover essa pessoa");
    }
  };

  const removeGroup = async () => {
    try {
      await groupRemoveByName(group);
      navigation.navigate("groups");
    } catch (error) {
      Alert.alert("Remover turma", "Não foi possível remover turma");
    }
  };

  const handleRemoveGroup = async () => {
    Alert.alert("Remover", "Deseja remover turma", [
      { text: "Não", style: "cancel" },
      { text: "Sim", onPress: () => removeGroup() },
    ]);
  };

  useEffect(() => {
    fetchPlayersByTeam();
  }, [team]);

  return (
    <Container>
      <Header showBackButton />

      <Highlight title={group} subtitle="Adicione a galera e separe os times" />

      <Form>
        <Input
          placeholder="Nome da pessoa"
          inputRef={newPlayerNameInputRef}
          autoCorrect={false}
          value={newPlayerName}
          onChangeText={setNewPlayerName}
          onSubmitEditing={handleAddPlayer}
          returnKeyType="done"
        />

        <ButtonIcon icon="add" onPress={handleAddPlayer} />
      </Form>

      <HeaderList>
        {isLoading ? (
          <Loading />
        ) : (
          <FlatList
            data={["Team A", "Team B"]}
            renderItem={({ item }) => (
              <Filter
                title={item}
                isActive={item === team}
                onPress={() => setTeam(item)}
              />
            )}
            keyExtractor={(item) => item}
            horizontal
          />
        )}
        <NumberOfPlayers>{players.length}</NumberOfPlayers>
      </HeaderList>

      <FlatList
        data={players}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PlayerCard
            name={item.name}
            onRemove={() => handleDeletePlayer(item.name)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <ListInput message="Não há pessoas nesse time" />
        )}
        contentContainerStyle={[
          { paddingBottom: 100 },
          players.length === 0 && { flex: 1 },
        ]}
      />

      <Button
        title="Remover turma"
        type="SECONDARY"
        onPress={handleRemoveGroup}
      />
    </Container>
  );
}
