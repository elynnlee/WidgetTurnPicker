// This is a widget that let's you choose teammates, randomly or by clicking on them

const { widget } = figma;
const {
  useSyncedState,
  useSyncedMap,
  usePropertyMenu,
  AutoLayout,
  Text,
  Frame,
  Image,
  useEffect,
} = widget;

const TEST_ACTIVE_USERS = [
  { ...figma.currentUser, name: "Colleen Lawrence", id: "1" },
  { ...figma.currentUser, name: "Jon Lambert", id: "2" },
  { ...figma.currentUser, name: "Pat Adkins", id: "3" },
  { ...figma.currentUser, name: "Thomas Hines", id: "4" },
  { ...figma.currentUser, name: "Kara Hansen", id: "5" },
  { ...figma.currentUser, name: "Emmett Frank", id: "6" },
  { ...figma.currentUser, name: "Gertrude Wilkerson", id: "7" },
  { ...figma.currentUser, name: "Dorothy Ramirez", id: "8" },
  { ...figma.currentUser, name: "Courtney Taylor", id: "9" },
  { ...figma.currentUser, name: "Mohammed Rice", id: "10" },
  { ...figma.currentUser, name: "Elizabeth Lambert", id: "11" },
  { ...figma.currentUser, name: "Jacqueline Hamilton", id: "12" },
  { ...figma.currentUser, name: "Amelia Henderson", id: "13" },
  // { ...figma.currentUser, name: "Rosie Ross", id: "14" },
  // { ...figma.currentUser, name: "Charlene Pierce", id: "15" },
  // { ...figma.currentUser, name: "Horace Hayes", id: "16" },
  // { ...figma.currentUser, name: "Lee Marsh", id: "17" },
  // { ...figma.currentUser, name: "Brenda Vasquez", id: "18" },
  // { ...figma.currentUser, name: "Homer Barnes", id: "19" },
  // { ...figma.currentUser, name: "Rickey Fitzgerald", id: "20" },
];

function Button({
  text,
  textSize = 14,
  onClick,
}: {
  text: string;
  textSize?: number;
  onClick: () => void;
}) {
  return (
    <AutoLayout
      stroke={"#2a2a2a"}
      strokeWidth={2}
      cornerRadius={100}
      padding={10}
      spacing={10}
      onClick={onClick}
    >
      <Text fill={"#2a2a2a"} fontSize={textSize}>
        {text}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubble({
  figmaUser,
  isActive = false,
  hasGone,
  onUserSelected = undefined,
}: {
  figmaUser: User;
  isActive?: boolean;
  hasGone?: number;
  onUserSelected?: (user: User) => void;
}) {
  const photoUrl = figmaUser.photoUrl;
  const teammateName = figmaUser.name;
  const diameter = isActive ? 50 : 30;
  const textWidth = isActive ? undefined : 80;
  const fontSize = isActive ? 20 : 12;
  return (
    <AutoLayout
      direction={"horizontal"}
      horizontalAlignItems="center"
      verticalAlignItems="center"
      spacing={12}
      opacity={hasGone ? 0.5 : 1}
      onClick={
        isActive || hasGone > 0 || !onUserSelected
          ? undefined
          : () => {
              onUserSelected(figmaUser);
            }
      }
    >
      <AutoLayout stroke={"#2a2a2a"} cornerRadius={100}>
        {photoUrl ? (
          <Image
            cornerRadius={6}
            width={diameter}
            height={diameter}
            src={photoUrl}
          />
        ) : (
          <Frame
            cornerRadius={6}
            width={diameter}
            height={diameter}
            fill="#2A2A2A"
          />
        )}
      </AutoLayout>
      <Text
        width={textWidth}
        horizontalAlignText={"left"}
        fontSize={fontSize}
        textDecoration={hasGone > 0 ? "strikethrough" : "none"}
      >
        {isActive ? `${teammateName}, it's your turn!` : teammateName}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubbleRow({
  user1 = null,
  user2 = null,
  user3 = null,
  onUserSelected,
}: {
  key?: any;
  user1?: [User | undefined, number | undefined];
  user2?: [User | undefined, number | undefined];
  user3?: [User | undefined, number | undefined];
  onUserSelected: (user: User) => void;
}) {
  return (
    <AutoLayout
      direction={"horizontal"}
      verticalAlignItems="center"
      horizontalAlignItems="center"
      spacing={30}
      padding={{ horizontal: 50 }}
    >
      {user1 && user1[0] ? (
        <TeammatePhotoBubble
          figmaUser={user1[0]}
          hasGone={user1[1]}
          onUserSelected={onUserSelected}
        />
      ) : null}
      {user2 && user2[0] ? (
        <TeammatePhotoBubble
          figmaUser={user2[0]}
          hasGone={user2[1]}
          onUserSelected={onUserSelected}
        />
      ) : null}
      {user3 && user3[0] ? (
        <TeammatePhotoBubble
          figmaUser={user3[0]}
          hasGone={user3[1]}
          onUserSelected={onUserSelected}
        />
      ) : null}
    </AutoLayout>
  );
}

function pickATeammate(
  users: Array<User>,
  userIdToGoneOrder: SyncedMap<number>
) {
  var eligibleTeammates = [];

  for (var i = 0; i < users.length; i++) {
    if (userIdToGoneOrder.get(users[i].id)) {
      continue;
    } else {
      eligibleTeammates.push(users[i]);
    }
  }

  const randIdx = Math.floor(Math.random() * eligibleTeammates.length);

  return eligibleTeammates[randIdx];
}

function getFilteredUsers(users: Array<User>) {
  var filteredList = [];
  var filteredIds = new Set();
  for (var i = 0; i < users.length; i++) {
    var curr = users[i].id;
    if (!filteredIds.has(curr)) {
      filteredIds.add(curr);
      filteredList.push(users[i]);
    }
  }
  return filteredList;
}

// get sorted list of users by whether they've gone
function getSortedByHasGone(
  users: Array<User>,
  userIdToGoneOrder: SyncedMap<number>
) {
  const usersWhoHaveGone = [];
  const usersWhoHaveNotGone = [];
  for (var i = 0; i < users.length; i++) {
    if (userIdToGoneOrder.get(users[i].id)) {
      usersWhoHaveGone.push(users[i]);
    } else {
      usersWhoHaveNotGone.push(users[i]);
    }
  }

  // combine the lists
  return [...usersWhoHaveNotGone, ...usersWhoHaveGone];
}

function Widget() {
  // List of active users
  const [users, setUsers] = useSyncedState<User[]>("users", () => {
    // uncomment for testing
    // return TEST_ACTIVE_USERS;

    // TODO: initialize activeUsers here instead
    return [];
  });

  const [activeTeammate, setActive] = useSyncedState<User | null>(
    "activeTeammate",
    null
  );
  const userIdToGoneOrder = useSyncedMap<number>("hasGone");
  const everyoneHasGone = users.every((user) => userIdToGoneOrder.get(user.id));

  const updateUsers = () => {
    // I'm sorting by sessionId to keep the list relatively stable
    const currentUsers = figma.activeUsers.sort(
      (a, b) => a.sessionId - b.sessionId
    );

    // uncomment if testing
    // var currentUsers = users;

    setUsers(currentUsers);
  };

  const resetHasGone = () => {
    userIdToGoneOrder.keys().forEach((k) => userIdToGoneOrder.delete(k));
  };

  const resetAll = () => {
    resetHasGone();
    setActive(null);
  };

  const userGoesNext = (user: User) => {
    // update map + say this person has gone
    userIdToGoneOrder.set(user.id, userIdToGoneOrder.size + 1);

    // designate which one is active
    setActive(user);
  };

  usePropertyMenu(
    [
      {
        tooltip: "Reset chosen people",
        propertyName: "reset",
        itemType: "action",
      },
      {
        tooltip: "Refresh list of people",
        propertyName: "refresh",
        itemType: "action",
      },
      userIdToGoneOrder.size !== 0 && {
        tooltip: "Undo",
        propertyName: "undo",
        itemType: "action",
      },
    ].filter(Boolean) as WidgetPropertyMenuItem[],
    (e) => {
      if (e.propertyName === "reset") {
        // reset
        resetAll();
        updateUsers();
      } else if (e.propertyName === "refresh") {
        // refresh
        updateUsers();
      } else if (e.propertyName === "undo") {
        // undo
        if (userIdToGoneOrder.size !== 0) {
          const sortedEntriesByGoneOrder = userIdToGoneOrder.entries();
          sortedEntriesByGoneOrder.sort((a, b) => {
            return b[1] - a[1];
          });

          // Find the most recent user and previous user
          const mostRecentUserId = sortedEntriesByGoneOrder[0][0];
          const nextUserId = sortedEntriesByGoneOrder[1]?.[0] ?? null;
          const nextUser = nextUserId
            ? users.find((user) => user.id === nextUserId)
            : null;

          userIdToGoneOrder.delete(mostRecentUserId);
          setActive(nextUser || null);
        } else {
          resetAll();
        }
      }
    }
  );

  useEffect(() => {
    if (users.length === 0) {
      updateUsers();
    }
  });

  return (
    <AutoLayout
      direction={"vertical"}
      fill={"#FFFFFF"}
      stroke={"#E6E6E6"}
      horizontalAlignItems={"center"}
      verticalAlignItems={"center"}
      spacing={20}
      cornerRadius={10}
      padding={{ top: 40, left: 20, right: 20, bottom: 40 }}
    >
      <AutoLayout
        direction="vertical"
        spacing={20}
        horizontalAlignItems={"center"}
        padding={{ top: 0, left: 0, right: 0, bottom: 15 }}
      >
        {
          // if there's an active teammate, display else say "click the button to choose a teammate"
          !activeTeammate ? (
            <Text
              verticalAlignText="center"
              width={400}
              horizontalAlignText="center"
              fontSize={20}
            >
              Choose someone by clicking their name or click "Next" to choose
              randomly
            </Text>
          ) : (
            <TeammatePhotoBubble figmaUser={activeTeammate} isActive={true} />
          )
        }
        {everyoneHasGone && <Text fontSize={16}>Everyone has had a turn!</Text>}
        {everyoneHasGone ? (
          <Button
            text={"Start over"}
            onClick={() => {
              resetAll();
            }}
          />
        ) : (
          <Button
            text={"Next (random)"}
            onClick={() => {
              userGoesNext(pickATeammate(users, userIdToGoneOrder));
            }}
          />
        )}
      </AutoLayout>
      <AutoLayout direction={"vertical"} spacing={20}>
        {getSortedByHasGone(getFilteredUsers(users), userIdToGoneOrder).map(
          (user, idx, users) => {
            if (idx % 3 != 0) {
              return null;
            }
            var user1hasGone = users[idx]
              ? userIdToGoneOrder.get(users[idx].id)
              : undefined;
            var user2hasGone = users[idx + 1]
              ? userIdToGoneOrder.get(users[idx + 1].id)
              : undefined;
            var user3hasGone = users[idx + 2]
              ? userIdToGoneOrder.get(users[idx + 2].id)
              : undefined;

            return (
              <TeammatePhotoBubbleRow
                key={idx}
                onUserSelected={(user) => {
                  userGoesNext(user);
                }}
                user1={[users[idx], user1hasGone]}
                user2={[users[idx + 1], user2hasGone]}
                user3={[users[idx + 2], user3hasGone]}
              />
            );
          }
        )}
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
