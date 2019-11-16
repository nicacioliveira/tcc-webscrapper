# Webscrapper de letras de músicas para meu trabalho de conclusão de curso

## Esse repositório é dedicado a descrever como foi feita a coleta de dados para a análise de letras de músicas

## Esse repositório visa transmitir conhecimento e objetivo meramente didático

# *Importante*

WebScrapping deve ser feito dentro das diretrizes da lei seguindo todas as políticas de privacidade e uso de dados de quem cede os dados.
Esse projeto utiliza o site letras.mus.br para coleta de daos e segue todas as [políticas de uso do site](https://www.letras.mus.br/aviso-legal.html).

### Descrição

Busca de dados para análise das letras de forró através de web scraping


Este é apenas um relato de como a busca dos dados de todos os artistas de forró foi feita, e pode ser feita, baseando-se no website www.letras.mus.br.

A busca pelos dados foi feita de uma forma que permita que outros pesquisadores possam utilizar os scripts para uma análise em outros gêneros musicais, artistas ou até mesmo permitir que exista um ponto de partida para esse tipo de análise.

Utilizei o node junto a biblioteca cheerio, puppeteer e sequelize. Apesar de JavaScript não ser a melhor ferramenta para essa atividade, para poupar tempo e focar na pesquisa, optei por utilizá-la apenas por proximidade com a linguagem. Também utilizei um banco de dados local mysql para facilitar a forma de manipulação dos dados e também pela fácil conexão com a linguagem R para análise posterior.

De maneira geral, os scripts utilizam requests http através da função request que é padrão do nodejs. A biblioteca cheerio foi utilizada para processar as páginas html obtidas nos requests e extrair o dados necessários.

Para buscar por datas das músicas, utilizei a biblioteca puppeteer que carrega um browser headless e permite automações. Existe uma certa dificuldade em datar letras de músicas devido a forma como elas são expostas na internet. Nesse caso, o esforço foi feito para, ao menos, encontrar datas aproximadas.


Observações

Devido a quantidade de dados ser relativamente grande, em alguns scripts a forma de salvar os dados é feita em lote para que o banco de dados consiga salvar todos os dados corretamente.

Os scripts são capazes de buscar por todos os dados do site de forma eficiente, porém a partir do momento em que a busca pelas letras das músicas se iniciou, o escopo foi reduzido para buscar apenas músicas de um gênero musical que era de interesse para análise e também pelo alto custo de processamento.

Na busca pelas letras e nomes das músicas, foi necessário assistir o processo de scrapping devido a problemas de conexão com a internet e também problemas relacionados a algumas páginas não existirem ou simplesmente por limitações do computador que foi utilizado.

Existem algumas limitações que precisamos lidar. Uma dessas é que se você exagerar na quantidade de logs durante a execução dos scripts, certamente irá ver em algum momento sua memória estourar e o script parar.








Os passos do processo foram os seguintes:

1 - Busca por artistas
2 - Busca por gêneros musicais
3 - Classificação dos artistas e seus respectivos gêneros musicais
4 - Busca por músicas com nomes e links dos artistas
5 - Busca pelas letras das músicas apoiando-se na lista de músicas encontradas
6 - Datação de letras

Nota: Essa ordem do processo foi feita apenas pela forma como implementei os scripts.

Nota: No repositório, você vai encontrar o shell script start.sh. Crie o banco de dados que está definido com o nome “tcc” e rode o script para criar as tabelas e relacionamentos.


Busca por artistas

No site letras existem listas de artistas por cada letra do alfabeto. Logo, a busca foi feita criando requests para todas as páginas por letra do alfabeto. Feito isso, todas as requests são resolvidas de forma assíncrona e o cheerio trata de filtrar as listas por tags html <li> salvando nome e link para página de cada artista.


Busca por gêneros

A busca por gêneros segue a mesma lógica da busca por artistas. Foram salvos todos os gêneros e seus respectivos links para facilitar a busca de artistas por gênero no passo seguinte.


Classificação de artistas por gênero musical

A partir desse ponto, é necessário ter um pouco mais de cautela na forma de salvar e buscar pelos dados devido a grande quantidade. O script é simples e tem o seguinte fluxo:

  - Busca pelos htmls de todas as páginas de gênero que possuem o nome e link para todos os artistas;
  - Espera que todos os htmls sejam resolvidos;
  - Faz busca no banco pela lista de artistas para cada estilo;
  - Salva um lote com os ids dos artistas e dos gêneros em uma tabela de relacionamento.

Busca por nomes e links de músicas

Aqui o escopo foi reduzido para buscar apenas músicas dos artistas de forró. Essa decisão foi tomada devido ao custo das buscas a partir desse ponto. O número de músicas dos artistas de forró até 15/09/2019 totalizaram 37 mil, além disso a motivação dessa busca de dados foi a análise de letras de músicas do gênero Forró.

Para facilitar as buscas das letras foi feito uma busca apenas por nomes e links das músicas através de uma lista de artistas pelo gênero. Após concluir a busca por links e nomes, bastou-se fazer uma busca para cada link de música diretamente e salvar suas respectivas letras.

O processo de busca por letras foi um pouco mais complexo e foi conduzido de forma assistida devido a falhas de conexão com a internet e alguns erros no scrapping das páginas de respostas. Empiricamente, baseando-se nos erros, devido a quantidade de requests simultâneas, o poder de processamento do computador e a conexão com a internet, cheguei ao número de 60 requisições de páginas de músicas por vez. Ou seja, a cada 60 requisições, espera-se a resolução de todas elas e em seguida faz-se mais 60 requisições. O processo foi repetido até completar as 37 mil músicas encontradas no site.


Busca por datas de músicas

Por fim, o ponto crítico dessa busca. O site letras.mus.br guarda apenas informação de ano do álbum do artista. Logo, teríamos a data de lançamento de cada letra baseando-se na data do álbum o qual a letra pertence. Porém, nem todos os artistas possuem letras baseadas em álbuns e isso nos restringe a termos apenas letras avulsas por artistas.

Devido a esse problema, foi feito um crawler que pesquisa o nome da composição junto ao nome do artista no buscador do google e copia o ano da composição, caso exista, em dois pontos que são: Resposta direta do google com o ano de lançamento ou data do primeiro vídeo que possui o nome da composição. Caso nenhum dos dados exista, o crawler ignora e passa para a próxima busca.
