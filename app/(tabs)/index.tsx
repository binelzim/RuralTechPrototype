import React, { useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet, ScrollView } from 'react-native';
import { db, ref, set, onValue, push, remove } from './firebaseConfig';

export default function App() {
  const [estadoRele, setEstadoRele] = useState("desconhecido");
  const [horaLigado, setHoraLigado] = useState(null);
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const comandoReleRef = ref(db, '/current_status/rele');
    onValue(comandoReleRef, (snapshot) => {
      setEstadoRele(snapshot.val() || "desconhecido");
    });

    const historicoReleRef = ref(db, '/historico_rele');
    onValue(historicoReleRef, (snapshot) => {
      const dados = snapshot.val();
      if (dados) {
        const listaHistorico = Object.entries(dados).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setHistorico(listaHistorico.reverse());
      } else {
        setHistorico([]);
      }
    });
  }, []);

  const getDataHoraAtual = () => new Date().toISOString();

  const alterarEstadoRele = (novoEstado) => {
    const comando = novoEstado === "ligado" ? "ligar" : "desligar";
    set(ref(db, '/current_status/comando_rele'), comando);

    if (novoEstado === "ligado") {
      setHoraLigado(getDataHoraAtual());
    } else if (novoEstado === "desligado" && horaLigado) {
      const evento = {
        status: "desligado",
        dataHoraLigado: horaLigado,
        dataHoraDesligado: getDataHoraAtual(),
      };
      push(ref(db, '/historico_rele'), evento);
      setHoraLigado(null);
    }
  };

  const excluirHistorico = (id) => {
    const historicoRef = ref(db, `/historico_rele/${id}`);
    remove(historicoRef).then(() => {
      console.log('Item removido com sucesso!');
    }).catch((error) => {
      console.error('Erro ao remover item: ', error);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitulo}>Estado Atual da Irrigação:</Text>
        <Text style={styles.statusValor}>{estadoRele}</Text>
      </View>
      
      <Button title="Ligar Irrigação" onPress={() => alterarEstadoRele("ligado")} />
      <Button title="Desligar Irrigação" onPress={() => alterarEstadoRele("desligado")} />
      
      <Text style={styles.historicoTitulo}>Histórico de Irrigação</Text>
      <ScrollView style={styles.historicoContainer}>
        {historico.length > 0 ? (
          historico.map((item) => (
            <View key={item.id} style={styles.historicoItem}>
              <Text>Status: {item.status}</Text>
              <Text>Ligado: {new Date(item.dataHoraLigado).toLocaleString()}</Text>
              <Text>Desligado: {new Date(item.dataHoraDesligado).toLocaleString()}</Text>
              <Button title="Excluir" onPress={() => excluirHistorico(item.id)} />
            </View>
          ))
        ) : (
          <Text style={styles.historicoVazio}>Nenhum histórico encontrado</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  statusContainer: {
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    alignItems: 'center',
  },
  statusTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginTop: 5,
  },
  historicoTitulo: {
    fontSize: 22,
    marginVertical: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historicoContainer: {
    flex: 1,
    marginTop: 10,
  },
  historicoItem: {
    padding: 15,
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  historicoVazio: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
