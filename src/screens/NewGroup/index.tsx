import { useState } from "react";
import { Header } from "@components/Header";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Input } from "@components/Input";
import { Highlight } from "@components/Highlight";
import { Container, Content, Icon } from "./styles";
import { Button } from "@components/Button";
import { groupCreate } from "@storage/group/groupCreate";
import { AppError } from "@utils/AppError";

export function NewGroup() {
  const navigation = useNavigation();
  const [group, setGroup] = useState("");

  const handleNew = async () => {
    try {
      if (group.trim().length === 0) {
        return Alert.alert("Novo Grupo", "Informe o nome da Turma");
      }

      await groupCreate(group);
      navigation.navigate("players", { group });
    } catch (error) {
      if (error instanceof AppError) {
        Alert.alert("Novo Grupo", error.message);
      } else {
        Alert.alert("Novo Grupo", "Não foi possível criar um novo grupo");
      }
    }
  };

  return (
    <Container>
      <Header showBackButton />
      <Content>
        <Icon />
        <Highlight
          title="Nova turma"
          subtitle="crie a turma para adicionar pessoas"
        />
        <Input placeholder="Nome da Turma" onChangeText={setGroup} />
        <Button title="Criar" style={{ marginTop: 20 }} onPress={handleNew} />
      </Content>
    </Container>
  );
}
